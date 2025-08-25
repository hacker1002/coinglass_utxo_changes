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