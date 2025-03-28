# Abrir o arquivo original e inverter as coordenadas
with open("coordenadas.txt", "r") as file:
    linhas = file.readlines()

# Processar e inverter as coordenadas
coordenadas_invertidas = [",".join(reversed(linha.strip().split(","))) for linha in linhas]

# Salvar no novo arquivo
with open("coordenadas_invertidas.txt", "w") as file:
    file.write("\n".join(coordenadas_invertidas))

print("Coordenadas invertidas salvas em 'coordenadas_invertidas.txt'")
