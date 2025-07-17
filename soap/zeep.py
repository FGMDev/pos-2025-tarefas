import zeep

wsdl_url = "https://www.dataaccess.com/webservicesserver/NumberConversion.wso?WSDL"

client = zeep.Client(wsdl=wsdl_url)

number = int(input("Digite um número inteiro: "))

result = client.service.NumberToWords(
    ubiNum=number
)

print(f"A representação por extenso em inglês do número {number} é: {result}")