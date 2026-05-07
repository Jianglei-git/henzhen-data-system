import pandas as pd

# 读取学校Excel文件
df_schools = pd.read_excel('深圳市学校名单.xlsx')

# 筛选罗湖区的学校
luohu_schools = df_schools[df_schools['区'] == '罗湖区']

print('罗湖区所有学校:')
print('=' * 80)
for _, row in luohu_schools.iterrows():
    name = str(row['学校名称']).strip()
    print(f"{name}")
    # 检查是否可能是高等学校
    if '大学' in name or '学院' in name or '高等' in name:
        print(f"   ⚠️  可能是高等学校!")
    print()

# 检查是否有任何高等学校
print('搜索所有可能的高等学校:')
print('=' * 80)
for _, row in df_schools.iterrows():
    name = str(row['学校名称']).strip()
    if '大学' in name or '学院' in name or '高等' in name:
        print(f"{row['区']} - {name}")
