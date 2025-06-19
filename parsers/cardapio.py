from xml.dom.minidom import parse

dom = parse("parsers/cardapio.xml")

cardapio = dom.documentElement

pratos = cardapio.getElementsByTagName('p:prato')

for prato in pratos:
    nome = prato.getElementsByTagName('p:nome')[0].firstChild.nodeValue
    refeicao = prato.getElementsByTagName('p:refeição')[0].firstChild.nodeValue
    preco = prato.getElementsByTagName('p:preço')[0].firstChild.nodeValue
    data = prato.getElementsByTagName('p:dataCadastro')[0].firstChild.nodeValue

    ingredientes = prato.getElementsByTagName('p:ingrediente')
    lista_ingredientes = [ing.firstChild.nodeValue for ing in ingredientes]

    print(f"Nome: {nome}")
    print(f"Refeição: {refeicao}")
    print(f"Preço: R${preco}")
    print(f"Data de Cadastro: {data}")
    print("Ingredientes:")
    for ing in lista_ingredientes:
        print(f" - {ing}")
    print("---\n")
