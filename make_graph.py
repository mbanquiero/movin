import matplotlib.pyplot as plt
import numpy as np

# Genero un grafico 

"""
gra_data = [1072271, 1072753, 1063692, 1063406, 1067962, 1045221, 1050879, 1040367, 1050088, 1046032, 1036233, 1028062, 1030179, 1021779, 1023893, 1012131, 1013337, 1014530, 1015638, 1016775, 1026293, 1011928, 1011098, 1011830, 1007316, 1009297, 1015624, 1012240, 1014501, 1004871, 999471, 1002657, 997378, 1000376, 998761, 1007463, 995270, 988197, 997573, 994931, 986976, 986440, 995909, 987112, 982600, 998961, 985143, 978839, 989350, 989141, 985175, 981764, 979274, 975965, 989378, 979808, 985979, 981006, 973831, 984907]
gra_data_min = [1072271, 1072271, 1063692, 1063406, 1063406, 1045221, 1045221, 1040367, 1040367, 1040367, 1036233, 1028062, 1028062, 1021779, 1021779, 1012131, 1012131, 1012131, 1012131, 1012131, 1012131, 1011928, 1011098, 1011098, 1007316, 1007316, 1007316, 1007316, 1007316, 1004871, 999471, 999471, 997378, 997378, 997378, 997378, 995270, 988197, 988197, 988197, 986976, 986440, 986440, 986440, 982600, 982600, 982600, 978839, 978839, 978839, 978839, 978839, 978839, 975965, 975965, 975965, 975965, 975965, 973831, 973831]
gra_base_line = 1064524;
plt.title("Convergencia Algoritmo Genético - Ciudad A")
"""

"""
gra_data = [1076376, 1040439, 1059377, 1091034, 1087772, 1034356, 1038466, 1057248, 1025467, 1022910, 1021769, 1015156, 1002397, 1003417, 1067202, 1087408, 1046711, 1031765, 998795, 994998, 994983, 994918, 995884, 994851, 1000186, 1031018, 994484, 988799, 986785, 992921, 981417, 998745, 973619, 991898, 980339, 975992, 980091, 973076, 973453, 1024618, 981379, 983409, 970351, 978540, 970901, 967246, 971566, 963048, 972518, 969830, 968085, 985864, 988571, 958832, 959917, 969265, 969825, 1064190, 962272, 957305]
gra_data_min =[1076376, 1040439, 1040439, 1040439, 1040439, 1034356, 1034356, 1034356, 1025467, 1022910, 1021769, 1015156, 1002397, 1002397, 1002397, 1002397, 1002397, 1002397, 998795, 994998, 994983, 994918, 994918, 994851, 994851, 994851, 994484, 988799, 986785, 986785, 981417, 981417, 973619, 973619, 973619, 973619, 973619, 973076, 973076, 973076, 973076, 973076, 970351, 970351, 970351, 967246, 967246, 963048, 963048, 963048, 963048, 963048, 963048, 958832, 958832, 958832, 958832, 958832, 958832, 957305]
gra_base_line = 1043770;
plt.title("Convergencia Algoritmo Genético - Ciudad B")
"""
gra_data = [205810, 200435, 191141, 185690, 202119, 189678, 191376, 182056, 179467, 191057, 178041, 190188, 174436, 170696, 176919, 172651, 176068, 170110, 170242, 169404, 191450, 174533, 184275, 173735, 177548, 171199, 167819, 167448, 168733, 192569, 168934, 168390, 163116, 167678, 164025, 164726, 161653, 167702, 170999, 164151, 187857, 165199, 164311, 164013, 166395, 165997, 163323, 164589, 164660, 163951, 163730, 164657, 164393, 163406, 164822, 162582, 190684, 164914, 163482, 161492]
gra_data_min = [205810, 200435, 191141, 185690, 185690, 185690, 185690, 182056, 179467, 179467, 178041, 178041, 174436, 170696, 170696, 170696, 170696, 170110, 170110, 169404, 169404, 169404, 169404, 169404, 169404, 169404, 167819, 167448, 167448, 167448, 167448, 167448, 163116, 163116, 163116, 163116, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161653, 161492]
gra_base_line = 190245
plt.title("Convergencia Algoritmo Genético - Ciudad C")



R = np.arange(0,60)
B = np.empty(60)
B.fill(gra_base_line)

plt.xlabel("Generación")
plt.ylabel("Emisión CO2")
plt.plot(R, gra_data,label = 'Mejor Actual')
plt.plot(R, gra_data_min,label = 'Mejor Global')
plt.plot(R, B,label = 'Valor de Referencia')
plt.legend()
plt.show()
