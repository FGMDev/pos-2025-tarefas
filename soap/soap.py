import requests
from xml.dom.minidom import parseString

url = "http://webservices.oorsprong.org/websamples.countryinfo/CountryInfoService.wso"

headers = {
    "Content-Type": "text/xml; charset=utf-8",
}

def get_capital(country_code):
    body = f"""
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <CapitalCity xmlns="http://www.oorsprong.org/websamples.countryinfo">
          <sCountryISOCode>{country_code}</sCountryISOCode>
        </CapitalCity>
      </soap:Body>
    </soap:Envelope>
    """
    response = requests.post(url, data=body.strip(), headers={**headers, "SOAPAction": "http://www.oorsprong.org/websamples.countryinfo/CountryInfoService.wso/CapitalCity"})
    dom = parseString(response.text)
    capital = dom.getElementsByTagName("m:CapitalCityResult")[0].firstChild.nodeValue
    print(f"\nCapital do país ({country_code}): {capital}")

def get_currency(country_code):
    body = f"""
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <CountryCurrency xmlns="http://www.oorsprong.org/websamples.countryinfo">
          <sCountryISOCode>{country_code}</sCountryISOCode>
        </CountryCurrency>
      </soap:Body>
    </soap:Envelope>
    """
    response = requests.post(url, data=body.strip(), headers={**headers, "SOAPAction": "http://www.oorsprong.org/websamples.countryinfo/CountryInfoService.wso/CountryCurrency"})
    dom = parseString(response.text)
    currency = dom.getElementsByTagName("m:sName")[0].firstChild.nodeValue
    print(f"\nMoeda do país ({country_code}): {currency}")

def get_country_name(country_code):
    body = f"""
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <CountryName xmlns="http://www.oorsprong.org/websamples.countryinfo">
          <sCountryISOCode>{country_code}</sCountryISOCode>
        </CountryName>
      </soap:Body>
    </soap:Envelope>
    """
    response = requests.post(url, data=body.strip(), headers={**headers, "SOAPAction": "http://www.oorsprong.org/websamples.countryinfo/CountryInfoService.wso/CountryName"})
    dom = parseString(response.text)
    country_name = dom.getElementsByTagName("m:CountryNameResult")[0].firstChild.nodeValue
    print(f"\nNome do país ({country_code}): {country_name}")

print("=== CONSULTA DE INFORMAÇÕES DE PAÍSES ===")
print("Digite o código ISO do país: ")
country_code = input("Código do país: ").strip().upper()

print("\nEscolha uma opção:")
print("1 - Ver capital do país")
print("2 - Ver moeda do país")
print("3 - Ver nome do país")

choice = input("Opção: ")

if choice == "1":
        get_capital(country_code)
elif choice == "2":
    get_currency(country_code)
elif choice == "3":
    get_country_name(country_code)
else:
    print("Opção inválida.")