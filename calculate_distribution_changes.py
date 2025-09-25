import json
from datetime import datetime

# Read the JSON data
with open('glassnode_utxo_data.json', 'r') as f:
    data = json.load(f)

# Sort data by timestamp to ensure chronological order
data.sort(key=lambda x: x['t'])

# Get only the last 1750 rows (or all if less than 1750)
last_1750_data = data[-1751:] if len(data) > 1750 else data

# Prepare the JSON data
json_data = []

# Process each consecutive pair of days
for i in range(1, len(last_1750_data)):
    yesterday = last_1750_data[i-1]
    today = last_1750_data[i]
    
    # Convert timestamp to date string
    date_str = datetime.fromtimestamp(today['t']).strftime('%Y-%m-%d')
    
    # Calculate distribution changes
    changes = []
    points_range = len(today['partitions'])
    
    # Handle case where partition counts differ - pad with zeros or truncate
    yesterday_index = 0
    for j in range(points_range):
        today_price = today['prices'][j]
        today_val = today['partitions'][j]
        yesterday_sum_val = 0
        while(yesterday_index < points_range):
            if (yesterday['prices'][yesterday_index] <= today_price):
                yesterday_sum_val += yesterday['partitions'][yesterday_index]
                yesterday_index += 1
            else:
                break
        change = today_val - yesterday_sum_val
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