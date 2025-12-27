import google.generativeai as genai
genai.configure(api_key="AIzaSyCD_4CR3Y82xKW13IVpgeI1vsuPMc-seFo")
for model in genai.list_models():
    print(model)