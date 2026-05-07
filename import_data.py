import pandas as pd
import json

# 读取小区Excel文件
df_communities = pd.read_excel('深圳市小区名单.xlsx')

# 读取学校Excel文件
xls = pd.ExcelFile('深圳市学校名单.xlsx')

# 读取"整体"sheet页
df_schools_main = pd.read_excel(xls, sheet_name='整体')

# 读取"高等学校"sheet页
df_schools_university = pd.read_excel(xls, sheet_name='高等学校')

# 处理小区数据
communities = []
for _, row in df_communities.iterrows():
    community = {
        'name': str(row['小区名称']).strip() if pd.notna(row['小区名称']) else '',
        'district': str(row['区']).strip() if pd.notna(row['区']) else '',
        'address': str(row['地址']).strip() if pd.notna(row['地址']) else '',
        'price': int(row['房价（元/㎡）']) if pd.notna(row['房价（元/㎡）']) else 0,
        'street': str(row['街道']).strip() if pd.notna(row['街道']) else '',
        'hot': str(row['是否热门商圈']).strip() == '是' if pd.notna(row['是否热门商圈']) else False,
        'lat': 0,
        'lng': 0
    }
    if community['name']:
        communities.append(community)

# 处理学校数据
schools = []

# 处理"整体"sheet页的数据
for _, row in df_schools_main.iterrows():
    name = str(row['学校名称']).strip() if pd.notna(row['学校名称']) else ''
    school_type = str(row['类型']).strip() if pd.notna(row['类型']) else ''
    
    if not school_type:
        if '小学' in name:
            school_type = '小学'
        elif '初中' in name:
            school_type = '初中'
        elif '高中' in name:
            school_type = '高中'
        elif '大学' in name or '学院' in name or '高等' in name:
            school_type = '高等学校'
        elif '中学' in name and '小学' not in name:
            school_type = '初中'
        else:
            school_type = '小学'
    
    school = {
        'name': name,
        'type': school_type,
        'district': str(row['区']).strip() if pd.notna(row['区']) else '',
        'street': str(row['街道']).strip() if pd.notna(row['街道']) else '',
        'address': str(row['地址']).strip() if pd.notna(row['地址']) else '',
        'nature': str(row['办学性质']).strip() if pd.notna(row['办学性质']) else '',
        'level': str(row['学校级别']).strip() if pd.notna(row['学校级别']) else '',
        'lat': 0,
        'lng': 0
    }
    if school['name']:
        schools.append(school)

# 处理"高等学校"sheet页的数据
for _, row in df_schools_university.iterrows():
    name = str(row['学校名称']).strip() if pd.notna(row['学校名称']) else ''
    
    school = {
        'name': name,
        'type': '高等学校',
        'district': str(row['区']).strip() if pd.notna(row['区']) else '',
        'street': str(row['街道']).strip() if pd.notna(row['街道']) else '',
        'address': str(row['地址']).strip() if pd.notna(row['地址']) else '',
        'nature': str(row['办学性质']).strip() if pd.notna(row['办学性质']) else '',
        'level': str(row['学校级别']).strip() if pd.notna(row['学校级别']) else '',
        'lat': 0,
        'lng': 0
    }
    if school['name']:
        schools.append(school)

# 生成小区数据文件
with open('data/communities.js', 'w', encoding='utf-8') as f:
    f.write('const communities = ' + json.dumps(communities, ensure_ascii=False, indent=2) + ';\n')
    f.write('\nconst districtColors = {\n')
    f.write('  "福田区": "#FF6B6B",\n')
    f.write('  "南山区": "#4ECDC4",\n')
    f.write('  "罗湖区": "#45B7D1",\n')
    f.write('  "宝安区": "#96CEB4",\n')
    f.write('  "龙岗区": "#DDA0DD",\n')
    f.write('  "龙华区": "#F7DC6F",\n')
    f.write('  "坪山区": "#F0B27A",\n')
    f.write('  "盐田区": "#85C1E9",\n')
    f.write('  "光明区": "#98D8C8",\n')
    f.write('  "大鹏新区": "#87CEEB",\n')
    f.write('  "深汕特别合作区": "#F8B500"\n')
    f.write('};\n')
    f.write('\nexport { communities, districtColors };')

# 生成学校数据文件
with open('data/schools.js', 'w', encoding='utf-8') as f:
    f.write('const schools = ' + json.dumps(schools, ensure_ascii=False, indent=2) + ';\n')
    f.write('\nconst schoolTypeColors = {\n')
    f.write('  "小学": "#87CEEB",\n')
    f.write('  "初中": "#98D8C8",\n')
    f.write('  "高中": "#F7DC6F",\n')
    f.write('  "高等学校": "#DDA0DD"\n')
    f.write('};\n')
    f.write('\nexport { schools, schoolTypeColors };')

# 统计各区域各类型学校数量
type_counts = {}
for school in schools:
    key = (school['district'], school['type'])
    if key not in type_counts:
        type_counts[key] = 0
    type_counts[key] += 1

print(f'成功导入 {len(communities)} 个小区和 {len(schools)} 所学校（整体+高等学校sheet页）')
print()
print('各区域学校类型统计:')
print('=' * 50)
districts = ['福田区', '南山区', '罗湖区', '宝安区', '龙岗区', '龙华区', '坪山区', '盐田区', '光明区', '大鹏新区']
types = ['小学', '初中', '高中', '高等学校']

print('区域'.ljust(12), end='')
for t in types:
    print(t.ljust(8), end='')
print()
print('-' * 50)

for district in districts:
    print(district.ljust(12), end='')
    for t in types:
        count = type_counts.get((district, t), 0)
        print(str(count).ljust(8), end='')
    print()
