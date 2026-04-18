import pandas as pd
import numpy as np
import os
import requests
import json
from fpdf import FPDF
from datetime import datetime
from dotenv import load_dotenv

class PurchaseOrderPDF(FPDF):
    def __init__(self, po_number, date_str):
        super().__init__()
        self.po_number = po_number
        self.date_str = date_str
        
    def header(self):
        # Company Info
        self.set_font('Arial', 'B', 14)
        self.set_text_color(0, 0, 0)
        self.cell(100, 6, 'Prince of Peace Enterprises, Inc.', 0, 0, 'L')
        
        # PURCHASE ORDER title
        self.set_font('Arial', 'B', 24)
        self.set_text_color(112, 146, 190) # Light blue matching the image
        self.cell(90, 8, 'PURCHASE ORDER', 0, 1, 'R')
        
        # Company Address
        self.set_font('Arial', '', 9)
        self.set_text_color(0, 0, 0)
        self.cell(100, 4, '3536 Arden Road', 0, 0, 'L')
        
        # Date & PO# table
        self.set_xy(140, 18)
        self.set_font('Arial', '', 9)
        self.cell(20, 5, 'DATE', 0, 0, 'R')
        self.cell(30, 5, self.date_str, 1, 1, 'C')
        
        self.set_xy(10, 22)
        self.cell(100, 4, 'Hayward, CA 94545', 0, 0, 'L')
        self.set_xy(140, 23)
        self.cell(20, 5, 'PO #', 0, 0, 'R')
        self.cell(30, 5, self.po_number, 1, 1, 'C')
        
        self.set_xy(10, 26)
        self.cell(100, 4, 'Phone: (510) 887-1899', 0, 1, 'L')
        self.cell(100, 4, 'Fax: (510) 887-2705', 0, 1, 'L')
        self.cell(100, 4, 'Website: popus.com', 0, 1, 'L')
        self.ln(10)

    def draw_vendor_shipto(self, location_code=None):
        # Background color for headers (Dark Blue)
        self.set_fill_color(56, 76, 126)
        self.set_text_color(255, 255, 255)
        self.set_font('Arial', 'B', 9)
        
        y = self.get_y()
        self.cell(85, 6, ' VENDOR', 0, 0, 'L', 1)
        self.set_xy(115, y)
        self.cell(85, 6, ' SHIP TO', 0, 1, 'L', 1)
        
        self.set_text_color(0, 0, 0)
        self.set_font('Arial', '', 9)
        
        vendor_info = [
            f"Vendor Code: {location_code}" if location_code else "[Vendor Company Name]",
        ]
        
        shipto_info = [
            "Prince of Peace",
            "Receiving Department",
            "3536 Arden Road",
            "Hayward, CA 94545",
            "Phone: (510) 887-1899",
            ""
        ]
        
        # Ensure vendor_info is at least 6 items long to avoid IndexError
        vendor_info.extend([''] * max(0, 6 - len(vendor_info)))
        shipto_info.extend([''] * max(0, 6 - len(shipto_info)))
        
        y_start = self.get_y()
        for i in range(6):
            self.set_xy(10, y_start + i*4)
            self.cell(85, 4, vendor_info[i], 0, 0, 'L')
            self.set_xy(115, y_start + i*4)
            self.cell(85, 4, shipto_info[i], 0, 0, 'L')
            
        self.set_y(y_start + 6*4 + 5)
        
    def draw_req_table(self):
        self.set_fill_color(56, 76, 126)
        self.set_text_color(255, 255, 255)
        self.set_font('Arial', 'B', 9)
        
        w = [45, 45, 45, 55]
        headers = ['REQUISITIONER', 'SHIP VIA', 'F.O.B.', 'SHIPPING TERMS']
        for i, header in enumerate(headers):
            self.cell(w[i], 6, header, 1, 0, 'C', 1)
        self.ln()
        
        self.set_text_color(0, 0, 0)
        self.set_font('Arial', '', 9)
        for i in range(4):
            self.cell(w[i], 6, '', 1, 0, 'C')
        self.ln(5)
        
    def draw_items_table(self, items):
        self.set_fill_color(56, 76, 126)
        self.set_text_color(255, 255, 255)
        self.set_font('Arial', 'B', 9)
        
        w = [30, 85, 15, 30, 30]
        headers = ['ITEM #', 'DESCRIPTION', 'QTY', 'UNIT PRICE', 'TOTAL']
        for i, header in enumerate(headers):
            self.cell(w[i], 6, header, 1, 0, 'C', 1)
        self.ln()
        
        self.set_text_color(0, 0, 0)
        self.set_font('Arial', '', 9)
        
        subtotal = 0.0
        
        for item in items:
            self.cell(w[0], 6, f"[{str(item['item_num'])[:13]}]", 'LR', 0, 'L')
            self.cell(w[1], 6, str(item['desc'])[:45], 'LR', 0, 'L')
            self.cell(w[2], 6, str(item['qty']), 'LR', 0, 'C')
            self.cell(w[3], 6, f"{item['unit_price']:.2f}", 'LR', 0, 'R')
            self.cell(w[4], 6, f"{item['total_price']:.2f}", 'LR', 0, 'R')
            self.ln()
            subtotal += item['total_price']
            
        # Draw empty lines to match the image's structure
        for _ in range(max(0, 18 - len(items))):
            self.cell(w[0], 6, '', 'LR', 0, 'L')
            self.cell(w[1], 6, '', 'LR', 0, 'L')
            self.cell(w[2], 6, '', 'LR', 0, 'C')
            self.cell(w[3], 6, '-', 'LR', 0, 'R')
            self.cell(w[4], 6, '-', 'LR', 0, 'R')
            self.ln()
            
        # Bottom border for the items list
        self.cell(sum(w), 0, '', 'T', 1)
        
        self.ln(2)
        y = self.get_y()
        
        # Comments Box
        self.set_xy(10, y)
        self.set_fill_color(200, 200, 200)
        self.set_font('Arial', 'B', 9)
        self.cell(100, 6, 'Comments or Special Instructions', 1, 1, 'L', 1)
        self.cell(100, 24, '', 1, 1, 'L')
        
        # Totals Section
        self.set_xy(125, y)
        self.set_font('Arial', '', 9)
        self.cell(35, 6, 'SUBTOTAL', 0, 0, 'R')
        self.cell(30, 6, f"{subtotal:.2f}", 1, 1, 'R')
        
        self.set_xy(125, y + 6)
        self.cell(35, 6, 'TAX', 0, 0, 'R')
        self.cell(30, 6, "-", 1, 1, 'R')
        
        self.set_xy(125, y + 12)
        self.cell(35, 6, 'SHIPPING', 0, 0, 'R')
        self.cell(30, 6, "-", 1, 1, 'R')
        
        self.set_xy(125, y + 18)
        self.cell(35, 6, 'OTHER', 0, 0, 'R')
        self.cell(30, 6, "-", 1, 1, 'R')
        
        self.set_xy(125, y + 24)
        self.set_fill_color(160, 180, 220)
        self.set_font('Arial', 'B', 9)
        self.cell(35, 6, 'TOTAL', 0, 0, 'R')
        self.cell(30, 6, f"$   {subtotal:.2f}", 1, 1, 'R', 1)
        
        # Footer text
        self.set_y(-30)
        self.set_font('Arial', '', 9)
        self.cell(0, 5, 'If you have any questions about this purchase order, please contact', 0, 1, 'C')
        self.cell(0, 5, '[Prince of Peace, (510) 887-1899, info@popus.com]', 0, 1, 'C')

def get_latest_csv(directory):
    if not os.path.exists(directory):
        return None
    csv_files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith('.csv')]
    if not csv_files:
        return None
    return max(csv_files, key=os.path.getmtime)

def generate_purchase_orders_pdf():
    # Define file paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_csv_dir = os.path.join(base_dir, 'output_csv')
    inventory_path = os.path.join(base_dir, '../public/data/POP_InventorySnapshot.csv')
    history_path = os.path.join(base_dir, '../public/data/POP_PurchaseOrderHistory.csv')
    output_dir = os.path.join(base_dir, 'outputs')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Load environment variables
    load_dotenv(os.path.join(base_dir, '.env'))
    blob_token = os.environ.get("BLOB_READ_WRITE_TOKEN")
    
    # Load inventory
    if not os.path.exists(inventory_path):
        print(f"Error: Inventory file not found at {inventory_path}")
        return
    df_inventory = pd.read_csv(inventory_path)
    df_inventory.columns = [c.strip() for c in df_inventory.columns]

    # Load history
    df_history = pd.DataFrame()
    if os.path.exists(history_path):
        try:
            df_history = pd.read_csv(history_path)
            df_history.columns = [c.strip() for c in df_history.columns]
            if 'PO Date' in df_history.columns:
                df_history['PO Date'] = pd.to_datetime(df_history['PO Date'], errors='coerce')
                df_history = df_history.sort_values(by='PO Date')
        except Exception as e:
            print(f"Error reading history file: {e}")

    # Load latest demand CSV
    latest_csv = get_latest_csv(output_csv_dir)
    if not latest_csv:
        print(f"No CSV files found in {output_csv_dir}")
        return
        
    print(f"Processing latest file: {latest_csv}")
    df_demand = pd.read_csv(latest_csv)
    df_demand.columns = [c.strip() for c in df_demand.columns]
    
    metadata_list = []
    
    # Group by LOCNCODE
    if 'LOCNCODE' not in df_demand.columns:
        print("Error: 'LOCNCODE' column not found in the CSV.")
        return
        
    for location_code, group in df_demand.groupby('LOCNCODE'):
        location_code = str(location_code).strip()
        
        # Setup PDF layout
        date_str = datetime.now().strftime("%m/%d/%Y")
        po_number = f"REC-{location_code}-001"
        
        pdf = PurchaseOrderPDF(po_number, date_str)
        pdf.add_page()
        
        pdf.draw_vendor_shipto(location_code)
        pdf.draw_req_table()

        items = []
        total_qty = 0
        total_cost = 0.0
        
        # Sort the items for this location by aggregate_metric descending if possible
        if 'aggregate_metric' in group.columns:
            group = group.sort_values(by='aggregate_metric', ascending=False)
            
        for _, row in group.iterrows():
            if 'ITEMNMBR' not in row:
                continue
                
            product = str(row['ITEMNMBR']).strip()
            
            # Quantity logic
            qty_to_order = 1
            if 'current_gap' in row:
                qty_val = float(row['current_gap'])
                if qty_val > 0:
                    qty_to_order = int(qty_val)
                    
            inv_row = df_inventory[df_inventory['Item Number'].str.strip() == product]
            description = "Unknown Item" if inv_row.empty else inv_row.iloc[0]['Description']
                
            unit_price = 0.0
            if not df_history.empty and 'Item Number' in df_history.columns and 'Unit Cost' in df_history.columns:
                item_history = df_history[df_history['Item Number'].str.strip() == product]
                if not item_history.empty:
                    recent_cost = item_history.iloc[-1]['Unit Cost']
                    unit_price = float(recent_cost) if not pd.isna(recent_cost) else 0.0
                    
            item_total = qty_to_order * unit_price
            
            items.append({
                'item_num': product,
                'desc': description,
                'qty': qty_to_order,
                'unit_price': unit_price,
                'total_price': item_total
            })
            
            total_qty += qty_to_order
            total_cost += item_total

        pdf.draw_items_table(items)
        
        # Save the output PDF
        output_filename = os.path.join(output_dir, f"Recommended_Purchase_Orders_{location_code}.pdf")
        pdf.output(output_filename)
        print(f"\n -> Created: {output_filename}")
        
        pdf_url = ""
        # --- Vercel Blob Upload for PDF ---
        if blob_token:
            try:
                with open(output_filename, 'rb') as f:
                    url = f"https://blob.vercel-storage.com/Recommended_Purchase_Orders_{location_code}.pdf"
                    headers = {
                        "authorization": f"Bearer {blob_token}",
                        "x-api-version": "7"
                    }
                    response = requests.put(url, headers=headers, data=f)
                    response.raise_for_status()
                    pdf_url = response.json().get("url")
                    print(f"    -> Uploaded to Vercel Blob: {pdf_url}")
            except Exception as e:
                print(f"    -> Error uploading PDF to Vercel Blob: {e}")
                
        metadata_list.append({
            "po_number": po_number,
            "vendor_code": location_code,
            "quantity": total_qty,
            "estimated_cost": round(total_cost, 2),
            "pdf_url": pdf_url
        })

    # Output metadata
    metadata_filename = os.path.join(output_dir, "po_metadata.json")
    with open(metadata_filename, 'w') as f:
        json.dump(metadata_list, f, indent=4)
        
    print(f"\n -> Created Metadata: {metadata_filename}")
        
    # Upload metadata.json to Vercel Blob
    if blob_token:
        try:
            with open(metadata_filename, 'rb') as f:
                url = f"https://blob.vercel-storage.com/po_metadata.json"
                headers = {
                    "authorization": f"Bearer {blob_token}",
                    "x-api-version": "7"
                }
                response = requests.put(url, headers=headers, data=f)
                response.raise_for_status()
                meta_url = response.json().get("url")
                print(f"    -> Uploaded Metadata to Vercel Blob: {meta_url}")
        except Exception as e:
            print(f"    -> Error uploading Metadata to Vercel Blob: {e}")
            
    if not blob_token:
        print("\nNote: BLOB_READ_WRITE_TOKEN environment variable not found.")
        print("To send these files to the frontend via Vercel Blob, make sure to add your Vercel Blob token to your .env file.")

if __name__ == "__main__":
    generate_purchase_orders_pdf()
