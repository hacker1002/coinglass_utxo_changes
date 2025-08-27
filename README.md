## Flow update new data:

- Go to https://studio.glassnode.com/charts/indicators.UtxoRealizedPriceDistributionAth?a=BTC&date=1755709200&mScl=lin&pScl=lin&resolution=24h&zoom=all , open Network tab to show all data from API `utxo_realized_price_distribution_ath`

- Copy response data, replace to `glassnode_utxo_data.json`

- Run `python calculate_distribution_changes.py` to calc distribution changes 

- Commit and push to main (for cicd)

### Data structure of UTXO price distribution:

```json
[
    {
      "t": 1684108800,
      "ath_price": 68642.3126881884,
      "current_price": 27291.5491884136,
      "total_supply": 19374508.544971,
      "partitions": [3908798.59770444, 335824.70875861, 37131.18362296, ...],
      "prices": [0, 686.423126881884, 1372.84625376377, ...] 
    },
    ...
]
```

- t: timestamp of date
- partitions: amount of token distribution in the price with same index (prices[0] has distribution partitions[0])
- prices: price in USD