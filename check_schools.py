import pandas as pd

# 读取学校Excel文件
df_schools = pd.read_excel('深圳市学校名单.xlsx')

# 统计各区域各类型学校数量
print('学校数据统计:')
print('=' * 50)

# 添加类型列
df_schools['类型'] = ''
for i, row in df_schools.iterrows():
    name = str(row['学校名称'])
    if '小学' in name:
        df_schools.loc[i, '类型'] = '小学'
    elif '初中' in name:
        df_schools.loc[i, '类型'] = '初中'
    elif '高中' in name:
        df_schools.loc[i, '类型'] = '高中'
    elif '大学' in name or '学院' in name or '高等' in name:
        df_schools.loc[i, '类型'] = '高等学校'
    elif '中学' in name:
        df_schools.loc[i, '类型'] = '初中'
    else:
        df_schools.loc[i, '类型'] = '未知'

# 按区域和类型统计
stats = df_schools.groupby(['区', '类型']).size().unstack(fill_value=0)
print(stats)
print()

# 显示福田区所有学校名称
print('福田区学校列表:')
print('=' * 50)
futian_schools = df_schools[df_schools['区'] == '福田区']
for _, row in futian_schools.iterrows():
    print(f"{row['学校名称']} - {row['类型']}")
