import pandas as pd

# 读取Excel文件，获取所有sheet页
xls = pd.ExcelFile('深圳市学校名单.xlsx')

print('Excel文件中的sheet页:')
print('=' * 50)
for sheet_name in xls.sheet_names:
    print(f"Sheet: {sheet_name}")
    df = pd.read_excel(xls, sheet_name=sheet_name)
    print(f"  行数: {len(df)}")
    print(f"  列名: {df.columns.tolist()}")
    print()

# 查看第一个sheet的部分数据
print('第一个sheet的数据预览:')
print('=' * 50)
df_first = pd.read_excel(xls, sheet_name=0)
print(df_first.head(10))
