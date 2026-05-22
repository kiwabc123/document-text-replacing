import zipfile
import xml.dom.minidom as minidom

docx_path = r'C:\Users\tiradet.j\Downloads\basic-invoice (1) (2).docx'

try:
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml_content = z.read('word/document.xml').decode('utf-8')
        
        # Pretty print first 3000 chars
        try:
            dom = minidom.parseString(xml_content)
            pretty_xml = dom.toprettyxml()[:3000]
            print(pretty_xml)
        except:
            # If pretty print fails, just print raw
            print(xml_content[:3000])
            
except Exception as e:
    print(f"Error: {e}")
