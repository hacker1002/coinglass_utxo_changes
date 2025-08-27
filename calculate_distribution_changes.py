import json
from datetime import datetime

# Read the JSON data
with open('glassnode_utxo_data.json', 'r') as f:
    data = json.load(f)

# Sort data by timestamp to ensure chronological order
data.sort(key=lambda x: x['t'])

# Get only the last 100 rows (or all if less than 100)
last_100_data = data[-101:] if len(data) > 100 else data

# Prepare the JSON data
json_data = []

# Process each consecutive pair of days
for i in range(1, len(last_100_data)):
    yesterday = last_100_data[i-1]
    today = last_100_data[i]
    
    # Convert timestamp to date string
    date_str = datetime.fromtimestamp(today['t']).strftime('%Y-%m-%d')
    
    # Calculate distribution changes
    changes = []
    
    # Ensure both days have the same number of price points
    if len(today['partitions']) == len(yesterday['partitions']):
        for j in range(len(today['partitions'])):
            change = today['partitions'][j] - yesterday['partitions'][j]
            changes.append(change)
    else:
        print(f"Warning: Different number of partitions on {date_str}")
        # Handle case where partition counts differ - pad with zeros or truncate
        max_len = max(len(today['partitions']), len(yesterday['partitions']))
        for j in range(max_len):
            today_val = today['partitions'][j] if j < len(today['partitions']) else 0
            yesterday_val = yesterday['partitions'][j] if j < len(yesterday['partitions']) else 0
            change = today_val - yesterday_val
            changes.append(change)
    
    # Calculate total change for this day (sum of all price bucket changes)
    total_change = sum(changes)
    
    # Get prices from today's data
    prices = today['prices'] if 'prices' in today else []
    
    # Create JSON object for this day
    json_data.append({
        'date': date_str,
        'total': total_change,
        'prices': prices,
        'changes': changes
    })

# Write to JSON file
json_file = 'public/distribution_changes.json'
with open(json_file, 'w') as f:
    json.dump(json_data, f, indent=2)

print(f"Converted {len(json_data)} days of distribution changes to {json_file}")
print(f"Each day has {len(json_data[0]['prices']) if json_data else 0} price points")