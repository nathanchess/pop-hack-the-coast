import pandas as pd
import numpy as np
import os
import requests
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

    def draw_vendor_shipto(self):
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
            "[Vendor Company Name]",
            "[Contact or Department]",
            "[Street Address]",
            "[City, ST ZIP]",
            "Phone: (000) 000-0000",
            "Fax: (000) 000-0000"
        ]
        
        shipto_info = [
            "Prince of Peace",
            "Receiving Department",
            "3536 Arden Road",
            "Hayward, CA 94545",
            "Phone: (510) 887-1899",
            ""
        ]
        
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

def generate_purchase_orders_pdf():
    # Define file paths
    base_dir = os.path.dirname(os.path.abspath(__file__))
    true_demand_path = os.path.join(base_dir, '../public/data/true_demand.csv')
    inventory_path = os.path.join(base_dir, '../public/data/POP_InventorySnapshot.csv')
    history_path = os.path.join(base_dir, '../public/data/POP_PurchaseOrderHistory.csv')
    output_dir = os.path.join(base_dir, 'outputs')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Load data
    if not os.path.exists(inventory_path):
        print(f"Error: Inventory file not found at {inventory_path}")
        return

    df_inventory = pd.read_csv(inventory_path)
    df_inventory.columns = [c.strip() for c in df_inventory.columns]

    if not os.path.exists(true_demand_path):
        sample_items = df_inventory['Item Number'].head(3).str.strip().tolist()
        df_demand = pd.DataFrame({
            'product': sample_items,
            'urgent': [True, False, True],
            'importance': [10, 5, 8],
            'predicted_demand': [50, 20, 100]
        })
        os.makedirs(os.path.dirname(true_demand_path), exist_ok=True)
        df_demand.to_csv(true_demand_path, index=False)
    else:
        df_demand = pd.read_csv(true_demand_path)
        
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

    # Sort demand by importance descending
    if 'importance' in df_demand.columns:
        df_demand = df_demand.sort_values(by='importance', ascending=False)
    
    # Setup PDF layout
    date_str = datetime.now().strftime("%m/%d/%Y")
    po_number = "REC-001"
    
    pdf = PurchaseOrderPDF(po_number, date_str)
    pdf.add_page()
    
    pdf.draw_vendor_shipto()
    pdf.draw_req_table()

    # Create Items List
    items = []
    print("Generating Recommended Purchase Orders PDF...")
    
    for _, row in df_demand.iterrows():
        product = str(row['product']).strip()
        predicted_demand = float(row.get('predicted_demand', 1))
        
        if predicted_demand <= 0:
            predicted_demand = 1
            
        inv_row = df_inventory[df_inventory['Item Number'].str.strip() == product]
        description = "Unknown Item" if inv_row.empty else inv_row.iloc[0]['Description']
            
        qty_to_order = int(predicted_demand * 30)
        if qty_to_order <= 0:
            qty_to_order = 1
            
        unit_price = 0.0
        if not df_history.empty and 'Item Number' in df_history.columns and 'Unit Cost' in df_history.columns:
            item_history = df_history[df_history['Item Number'].str.strip() == product]
            if not item_history.empty:
                recent_cost = item_history.iloc[-1]['Unit Cost']
                unit_price = float(recent_cost) if not pd.isna(recent_cost) else 0.0
                
        total_price = qty_to_order * unit_price
        
        items.append({
            'item_num': product,
            'desc': description,
            'qty': qty_to_order,
            'unit_price': unit_price,
            'total_price': total_price
        })

    pdf.draw_items_table(items)
    
    # Save the output
    output_filename = os.path.join(output_dir, "Recommended_Purchase_Orders.pdf")
    pdf.output(output_filename)
    print(f" -> Created: {output_filename}")
    
    # --- Vercel Blob Upload ---
    # Load environment variables from .env in the same directory
    load_dotenv(os.path.join(base_dir, '.env'))
    
    # To upload to Vercel Blob, you need to have the BLOB_READ_WRITE_TOKEN
    # set in your environment variables.
    blob_token = os.environ.get("BLOB_READ_WRITE_TOKEN")
    
    if blob_token:
        print("Uploading PDF to Vercel Blob...")
        try:
            with open(output_filename, 'rb') as f:
                # The Vercel Blob REST API for file uploads
                url = "https://blob.vercel-storage.com/Recommended_Purchase_Orders.pdf"
                headers = {
                    "authorization": f"Bearer {blob_token}",
                    "x-api-version": "7"
                }
                
                response = requests.put(url, headers=headers, data=f)
                response.raise_for_status()
                
                blob_data = response.json()
                blob_url = blob_data.get("url")
                print(f" -> Successfully uploaded to Vercel Blob!")
                print(f" -> Access URL: {blob_url}")
                
                # You can then pass this URL to your frontend
                
        except Exception as e:
            print(f" -> Error uploading to Vercel Blob: {e}")
    else:
        print("\nNote: BLOB_READ_WRITE_TOKEN environment variable not found.")
        print("To send this PDF to the frontend via Vercel Blob, make sure to add your Vercel Blob token to your environment.")

if __name__ == "__main__":
    generate_purchase_orders_pdf()
