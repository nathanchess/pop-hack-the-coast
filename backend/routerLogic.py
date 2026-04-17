from model import model, AgentState, tools

def router_logic(state: AgentState):
    return state["next_step"]