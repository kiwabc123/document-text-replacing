import zipfile
import re

docx_path = r'C:\Users\tiradet.j\Downloads\basic-invoice (1) (2).docx'

try:
    with zipfile.ZipFile(docx_path, 'r') as z:
        xml_content = z.read('word/document.xml').decode('utf-8')
        
        # Find all variable patterns
        var_pattern = r'\{\{([^}]+?)\}\}'
        matches = re.findall(var_pattern, xml_content)
        
        print(f"Found {len(matches)} variable placeholders:")
        for match in matches:
            print(f"  - {match}")
            
        print("\n=== First 500 chars containing variables ===")
        # Find the first occurrence of {{
        idx = xml_content.find('{{')
        if idx > 0:
            print(xml_content[max(0, idx-200):idx+300])
        else:
            print("No {{ found in XML")
            
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
