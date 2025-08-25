import csv
import json

# Read the CSV file
csv_file = 'public/distribution_changes.csv'
json_file = 'public/distribution_changes.json'

data = []

with open(csv_file, 'r') as f:
    reader = csv.DictReader(f)
    
    for row in reader:
        # Extract date and total
        date = row['Date']
        total = float(row['Total'])
        
        # Extract price headers and changes
        prices = []
        changes = []
        
        for key, value in row.items():
            if key not in ['Date', 'Total']:
                prices.append(float(key))
                changes.append(float(value))
        
        data.append({
            'date': date,
            'total': total,
            'prices': prices,
            'changes': changes
        })

# Write to JSON file
with open(json_file, 'w') as f:
    json.dump(data, f, indent=2)

print(f"Converted {len(data)} days of distribution changes to {json_file}")
print(f"Each day has {len(data[0]['prices']) if data else 0} price points")