# Download Service API
### Fetch the Download Link
```
POST https://api2.simple105.com/download
```
Content-type: application/json

Body: should contains the assets urls as JSON like this example
```
{"assets": ["https://media.purefishing.com/i/purefishing/Abu_Garcia_Zata_Casting_Combo_2020_alt3?w=300",
            "https://media.purefishing.com/i/purefishing/Abu_Garcia_Zata_Casting_Combo_2020_alt3?w=300"
           ]
}
```
Response: will contains the download link as the following
```
{
"succeed": 1,
"location": "https://assets.simple105.com/1648e1df-b588-4757-93d9-d8d3b788b112.zip"
}
```
### Delete the Zip Files API
```
POST https://api2.simple105.com/purge
```
Content-type: application/json

Body: should contains the assets urls as JSON like this example
```
{"files": ["https://assets.simple105.com/1648e1df-b588-4757-93d9-d8d3b788b112.zip",
            "https://assets.simple105.com/2748e1df-b588-4757-93d9-d8d3b788b1134.zip"
           ]
}
```
Response: In case it succeeded 
```
{
  "succeed": 1,
  "data": {
    "Deleted": [
      {
        "Key": "1648e1df-b588-4757-93d9-d8d3b788b112.zip"
      },
      {
        "Key": "2748e1df-b588-4757-93d9-d8d3b788b1134.zip"
      }
    ],
    "Errors": []
  }
}
```
If An error happened 
```
{
"succeed": 0,
"error": "<error-message>"
}
```
