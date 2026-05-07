import { communities, districtColors } from './data/communities.js';
import { schools, schoolTypeColors } from './data/schools.js';

// 计算各区平均房价
const districtPrices = {};
communities.forEach(c => {
  if (!districtPrices[c.district]) {
    districtPrices[c.district] = { sum: 0, count: 0 };
  }
  districtPrices[c.district].sum += c.price;
  districtPrices[c.district].count++;
});

const avgPrices = {};
Object.keys(districtPrices).forEach(district => {
  avgPrices[district] = Math.round(districtPrices[district].sum / districtPrices[district].count);
});

let currentDistrict = '';

// 切换标签
function switchTab(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  
  document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
  document.getElementById(`${tabName}Tab`).classList.add('active');
  
  if (tabName === 'school') {
    renderSchoolList();
  }
}

// 处理区域点击
function handleDistrictClick(event) {
  const target = event.target;
  if (target.classList.contains('district')) {
    // 重置地图高亮状态
    resetMapHighlight();
    
    const district = target.dataset.district;
    currentDistrict = district;
    showDistrictCommunities(district);
    showDistrictSchools(district);
    switchTab('community');
  }
}

// 显示区域小区列表（按房价降序排列）
function showDistrictCommunities(district) {
  const title = document.getElementById('communityTitle');
  const list = document.getElementById('communityList');
  
  title.textContent = `${district} - 小区列表 (均价: ¥${formatPrice(avgPrices[district])}/㎡)`;
  
  let districtCommunities = communities.filter(c => c.district === district);
  // 按房价降序排列
  districtCommunities.sort((a, b) => b.price - a.price);
  
  if (districtCommunities.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏠</div>
        <p>该区域暂无小区数据</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = districtCommunities.map((c, index) => `
    <div class="list-item" onclick="showCommunityDetail('${c.name}')">
      <div class="list-item-header">
        <span class="list-item-name">${index + 1}. ${c.name}</span>
        <span class="list-item-price">¥${formatPrice(c.price)}/㎡</span>
      </div>
      <div class="list-item-address">📍 ${c.address}</div>
      ${c.hot ? '<div class="hot-tag">🔥 热门</div>' : ''}
    </div>
  `).join('');
}

// 显示区域学校列表（按类型分组）
function showDistrictSchools(district) {
  const title = document.getElementById('schoolTitle');
  const list = document.getElementById('schoolList');
  
  title.textContent = `${district} - 学校列表`;
  
  const districtSchools = schools.filter(s => s.district === district);
  
  if (districtSchools.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏫</div>
        <p>该区域暂无学校数据</p>
      </div>
    `;
    return;
  }
  
  // 按类型分组
  const schoolTypes = ['小学', '初中', '高中', '高等学校'];
  const schoolIcons = { '小学': '🏫', '初中': '🏢', '高中': '🏛️', '高等学校': '🎓' };
  
  let html = '';
  schoolTypes.forEach(type => {
    const typeSchools = districtSchools.filter(s => s.type === type);
    if (typeSchools.length > 0) {
      html += `
        <h4 style="margin: 20px 0 10px; color: #333;">${schoolIcons[type]} ${type}</h4>
        ${typeSchools.map(s => `
          <div class="list-item">
            <div class="list-item-header">
              <span class="list-item-name">${s.name}</span>
              <span class="school-type ${s.type}">${s.type}</span>
            </div>
            <div class="list-item-address">📍 ${s.address}</div>
          </div>
        `).join('')}
      `;
    }
  });
  
  list.innerHTML = html;
}

// 渲染学校列表
function renderSchoolList() {
  const list = document.getElementById('schoolList');
  const districtFilter = document.getElementById('districtSelect').value;
  const typeFilter = document.getElementById('schoolTypeSelect').value;
  
  // 如果有当前选中的区域且没有手动选择其他区域，则使用当前区域
  const effectiveDistrict = districtFilter || currentDistrict;
  
  let filteredSchools = schools;
  
  if (effectiveDistrict) {
    filteredSchools = filteredSchools.filter(s => s.district === effectiveDistrict);
  }
  
  if (typeFilter) {
    filteredSchools = filteredSchools.filter(s => s.type === typeFilter);
  }
  
  const districtName = effectiveDistrict || '全部区域';
  
  document.getElementById('schoolTitle').textContent = `${districtName} - 学校列表`;
  
  if (filteredSchools.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏫</div>
        <p>暂无符合条件的学校</p>
      </div>
    `;
    return;
  }
  
  // 如果没有选择具体类型，则按类型分组显示
  if (!typeFilter && effectiveDistrict) {
    const schoolTypes = ['小学', '初中', '高中', '高等学校'];
    const schoolIcons = { '小学': '🏫', '初中': '🏢', '高中': '🏛️', '高等学校': '🎓' };
    
    let html = '';
    schoolTypes.forEach(type => {
      const typeSchools = filteredSchools.filter(s => s.type === type);
      if (typeSchools.length > 0) {
        html += `
          <h4 style="margin: 20px 0 10px; color: #333;">${schoolIcons[type]} ${type}</h4>
          ${typeSchools.map(s => `
            <div class="list-item">
              <div class="list-item-header">
                <span class="list-item-name">${s.name}</span>
                <span class="school-type ${s.type}">${s.type}</span>
              </div>
              <div class="list-item-address">📍 ${s.address}</div>
            </div>
          `).join('')}
        `;
      }
    });
    
    list.innerHTML = html;
  } else {
    // 有类型筛选或没有区域筛选时，直接列表显示
    list.innerHTML = filteredSchools.map(s => `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-name">${s.name}</span>
          <span class="school-type ${s.type}">${s.type}</span>
        </div>
        <div class="list-item-address">📍 ${s.address}</div>
        <div class="list-item-meta">
          <span>区域: ${s.district}</span>
        </div>
      </div>
    `).join('');
  }
}

// 清除搜索
function clearSearch() {
  // 清空输入框
  document.getElementById('communityInput').value = '';
  
  // 重置地图高亮
  resetMapHighlight();
  
  // 重置当前区域
  currentDistrict = '';
  
  // 重置小区列表显示
  document.getElementById('communityTitle').textContent = '选择区域查看小区';
  document.getElementById('communityList').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🏠</div>
      <p>点击地图上的区域查看小区列表</p>
    </div>
  `;
  
  // 重置学校列表显示
  document.getElementById('schoolTitle').textContent = '选择区域查看学校';
  document.getElementById('schoolList').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🏫</div>
      <p>点击地图上的区域查看学校列表</p>
    </div>
  `;
  
  // 重置结果页显示
  document.getElementById('resultTitle').textContent = '查询结果';
  document.getElementById('resultContent').innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">🔍</div>
      <p>输入小区名称进行查询</p>
    </div>
  `;
  
  // 切换到小区列表标签
  switchTab('community');
}

// 搜索附近
function searchNearby() {
  const communityName = document.getElementById('communityInput').value.trim();
  
  if (!communityName) {
    alert('请输入小区名称');
    return;
  }
  
  const targetCommunity = communities.find(c => 
    c.name.includes(communityName) || c.address.includes(communityName)
  );
  
  if (!targetCommunity) {
    const resultContent = document.getElementById('resultContent');
    resultContent.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>未找到名为"${communityName}"的小区</p>
        <p class="hint">请尝试其他关键词，如：华润深圳湾悦府、壹方中心玖誉</p>
      </div>
    `;
    switchTab('result');
    return;
  }
  
  // 高亮地图区域
  highlightDistrict(targetCommunity.district);
  
  // 设置当前区域
  currentDistrict = targetCommunity.district;
  
  // 计算附近学校和小区
  const results = calculateNearby(targetCommunity);
  
  // 渲染结果（直接显示学校类型按钮）
  renderSearchResultsWithSchoolTabs(targetCommunity, results);
  switchTab('result');
}

// 高亮地图区域
function highlightDistrict(district) {
  const districts = document.querySelectorAll('.district');
  districts.forEach(d => {
    if (d.dataset.district === district) {
      d.style.opacity = '1';
      d.style.filter = 'drop-shadow(0 0 10px rgba(255,255,0,0.8))';
      d.style.transform = 'scale(1.02)';
      d.style.transition = 'all 0.3s ease';
    } else {
      d.style.opacity = '0.3';
      d.style.filter = 'grayscale(50%)';
      d.style.transform = 'scale(1)';
      d.style.transition = 'all 0.3s ease';
    }
  });
}

// 重置地图高亮
function resetMapHighlight() {
  const districts = document.querySelectorAll('.district');
  districts.forEach(d => {
    d.style.opacity = '0.8';
    d.style.filter = 'none';
    d.style.transform = 'scale(1)';
  });
}

// 计算附近
function calculateNearby(community) {
  const nearby = {
    universities: [],
    primarySchools: [],
    middleSchools: [],
    communities: []
  };
  
  // 计算距离
  schools.forEach(school => {
    const distance = calculateDistance(community.lat, community.lng, school.lat, school.lng);
    school.distance = distance;
    
    if (school.type === '高等学校') {
      nearby.universities.push(school);
    } else if (school.type === '小学') {
      nearby.primarySchools.push(school);
    } else if (school.type === '初中') {
      nearby.middleSchools.push(school);
    }
  });
  
  // 附近小区（排除自己）
  communities.forEach(c => {
    if (c.name !== community.name) {
      const distance = calculateDistance(community.lat, community.lng, c.lat, c.lng);
      c.distance = distance;
      nearby.communities.push(c);
    }
  });
  
  // 按距离排序
  nearby.universities.sort((a, b) => a.distance - b.distance);
  nearby.primarySchools.sort((a, b) => a.distance - b.distance);
  nearby.middleSchools.sort((a, b) => a.distance - b.distance);
  nearby.communities.sort((a, b) => a.distance - b.distance);
  
  // 取前5个
  nearby.universities = nearby.universities.slice(0, 5);
  nearby.primarySchools = nearby.primarySchools.slice(0, 5);
  nearby.middleSchools = nearby.middleSchools.slice(0, 5);
  nearby.communities = nearby.communities.slice(0, 5);
  
  return nearby;
}

// 计算两点距离（简化计算）
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半径(km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

// 渲染搜索结果（带学校类型按钮）
function renderSearchResultsWithSchoolTabs(community, results) {
  const resultContent = document.getElementById('resultContent');
  const resultTitle = document.getElementById('resultTitle');
  
  resultTitle.textContent = `${community.name} - ${community.district}`;
  
  // 获取该区域的学校（按类型分组）
  const districtSchools = schools.filter(s => s.district === community.district);
  const schoolsByType = {
    '小学': districtSchools.filter(s => s.type === '小学'),
    '初中': districtSchools.filter(s => s.type === '初中'),
    '高中': districtSchools.filter(s => s.type === '高中'),
    '高等学校': districtSchools.filter(s => s.type === '高等学校')
  };
  
  resultContent.innerHTML = `
    <!-- 小区信息卡片 -->
    <div class="list-item highlight-card">
      <div class="list-item-header">
        <span class="list-item-name">📍 ${community.name}</span>
        <span class="list-item-price">¥${formatPrice(community.price)}/㎡</span>
      </div>
      <div class="list-item-address">📍 ${community.address}</div>
      <div class="list-item-meta">
        <span>区域: ${community.district}</span>
        <span>区域均价: ¥${formatPrice(avgPrices[community.district])}/㎡</span>
      </div>
    </div>
    
    <!-- 学校类型切换按钮 -->
    <div id="resultSchoolButtons" class="school-type-buttons">
      <button class="type-btn active" onclick="showSchoolTypeInResult('小学', '${community.district}')">🏫 小学</button>
      <button class="type-btn" onclick="showSchoolTypeInResult('初中', '${community.district}')">🏢 初中</button>
      <button class="type-btn" onclick="showSchoolTypeInResult('高中', '${community.district}')">🏛️ 高中</button>
      <button class="type-btn" onclick="showSchoolTypeInResult('高等学校', '${community.district}')">🎓 高等教育</button>
    </div>
    
    <!-- 学校列表 -->
    <div id="resultSchoolList">
      ${renderSchoolTypeList(schoolsByType['小学'], '小学')}
    </div>
    
    <!-- 附近小区 -->
    <h4 style="margin: 20px 0 10px; color: #333;">🏠 同区其他小区（按房价降序）</h4>
    <div id="resultCommunityList">
      ${renderNearbyCommunities(community)}
    </div>
  `;
}

// 渲染学校类型列表
function renderSchoolTypeList(schoolList, type) {
  if (schoolList.length === 0) {
    return `
      <div class="empty-state">
        <div class="empty-icon">🏫</div>
        <p>该区域暂无${type}数据</p>
      </div>
    `;
  }
  
  return schoolList.map(s => `
    <div class="list-item school-item">
      <div class="list-item-header">
        <span class="list-item-name">${s.name}</span>
        <span class="school-type ${s.type}">${s.type}</span>
      </div>
      <div class="list-item-address">📍 ${s.address}</div>
      <div class="list-item-meta">
        <span>街道: ${s.street}</span>
        ${s.level ? `<span>级别: ${s.level}</span>` : ''}
        ${s.nature ? `<span>性质: ${s.nature}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// 渲染附近小区
function renderNearbyCommunities(targetCommunity) {
  let nearbyCommunities = communities.filter(c => 
    c.district === targetCommunity.district && c.name !== targetCommunity.name
  );
  // 按房价降序排列
  nearbyCommunities.sort((a, b) => b.price - a.price);
  nearbyCommunities = nearbyCommunities.slice(0, 10);
  
  if (nearbyCommunities.length === 0) {
    return '<p style="color: #999; padding: 10px;">该区域暂无其他小区</p>';
  }
  
  return nearbyCommunities.map((c, index) => `
    <div class="list-item" onclick="showCommunityDetail('${c.name}')">
      <div class="list-item-header">
        <span class="list-item-name">${index + 1}. ${c.name}</span>
        <span class="list-item-price">¥${formatPrice(c.price)}/㎡</span>
      </div>
      <div class="list-item-address">📍 ${c.address}</div>
      ${c.hot ? '<div class="hot-tag">🔥 热门</div>' : ''}
    </div>
  `).join('');
}

// 在结果页切换学校类型
function showSchoolTypeInResult(type, district) {
  // 更新按钮状态
  const buttons = document.querySelectorAll('#resultSchoolButtons .type-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent.includes(type)) {
      btn.classList.add('active');
    }
  });
  
  // 获取该区域该类型的学校
  const schoolList = schools.filter(s => s.district === district && s.type === type);
  
  // 更新列表
  document.getElementById('resultSchoolList').innerHTML = renderSchoolTypeList(schoolList, type);
}

// 渲染搜索结果（旧版，保留兼容）
function renderSearchResults(community, results) {
  const resultContent = document.getElementById('resultContent');
  const resultTitle = document.getElementById('resultTitle');
  
  resultTitle.textContent = `搜索结果 - ${community.name}`;
  
  resultContent.innerHTML = `
    <div class="list-item" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <div class="list-item-header">
        <span class="list-item-name" style="color: white;">📍 ${community.name}</span>
        <span class="list-item-price" style="color: #ffeaa7;">¥${formatPrice(community.price)}/㎡</span>
      </div>
      <div class="list-item-address" style="color: rgba(255,255,255,0.9);">${community.address}</div>
      <div class="list-item-meta" style="color: rgba(255,255,255,0.8);">
        <span>区域: ${community.district}</span>
      </div>
    </div>
    
    <h4 style="margin: 20px 0 10px; color: #333;">🏛️ 附近高等学校</h4>
    ${results.universities.length > 0 ? results.universities.map(s => `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-name">${s.name}</span>
          <span class="distance-tag">${s.distance.toFixed(2)}km</span>
        </div>
        <div class="list-item-address">📍 ${s.address}</div>
        <div class="list-item-meta">
          <span>区域: ${s.district}</span>
        </div>
      </div>
    `).join('') : '<p style="color: #999; padding: 10px;">暂无附近高等学校</p>'}
    
    <h4 style="margin: 20px 0 10px; color: #333;">🏫 附近小学</h4>
    ${results.primarySchools.length > 0 ? results.primarySchools.map(s => `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-name">${s.name}</span>
          <span class="distance-tag">${s.distance.toFixed(2)}km</span>
        </div>
        <div class="list-item-address">📍 ${s.address}</div>
        <div class="list-item-meta">
          <span>区域: ${s.district}</span>
        </div>
      </div>
    `).join('') : '<p style="color: #999; padding: 10px;">暂无附近小学</p>'}
    
    <h4 style="margin: 20px 0 10px; color: #333;">🏢 附近初中</h4>
    ${results.middleSchools.length > 0 ? results.middleSchools.map(s => `
      <div class="list-item">
        <div class="list-item-header">
          <span class="list-item-name">${s.name}</span>
          <span class="distance-tag">${s.distance.toFixed(2)}km</span>
        </div>
        <div class="list-item-address">📍 ${s.address}</div>
        <div class="list-item-meta">
          <span>区域: ${s.district}</span>
        </div>
      </div>
    `).join('') : '<p style="color: #999; padding: 10px;">暂无附近初中</p>'}
    
    <h4 style="margin: 20px 0 10px; color: #333;">🏠 附近小区</h4>
    ${results.communities.length > 0 ? results.communities.map(c => `
      <div class="list-item" onclick="showCommunityDetail('${c.name}')">
        <div class="list-item-header">
          <span class="list-item-name">${c.name}</span>
          <span class="list-item-price">¥${formatPrice(c.price)}/㎡</span>
        </div>
        <div class="list-item-address">📍 ${c.address}</div>
        <div class="list-item-meta">
          <span>区域: ${c.district}</span>
          <span>距离: ${c.distance.toFixed(2)}km</span>
        </div>
      </div>
    `).join('') : '<p style="color: #999; padding: 10px;">暂无附近小区</p>'}
  `;
}

// 显示小区详情弹窗
function showCommunityDetail(name) {
  const community = communities.find(c => c.name === name);
  if (!community) return;
  
  const modal = document.getElementById('communityModal');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');
  
  modalTitle.textContent = `${community.name} - 详情`;
  modalBody.innerHTML = `
    <div class="modal-row">
      <span class="modal-label">小区名称</span>
      <span class="modal-value">${community.name}</span>
    </div>
    <div class="modal-row">
      <span class="modal-label">所在区域</span>
      <span class="modal-value">${community.district}</span>
    </div>
    <div class="modal-row">
      <span class="modal-label">详细地址</span>
      <span class="modal-value">${community.address}</span>
    </div>
    <div class="modal-row">
      <span class="modal-label">参考房价</span>
      <span class="modal-value modal-highlight">¥${formatPrice(community.price)}/㎡</span>
    </div>
    <div class="modal-row">
      <span class="modal-label">区域均价</span>
      <span class="modal-value">¥${formatPrice(avgPrices[community.district])}/㎡</span>
    </div>
  `;
  
  modal.style.display = 'block';
}

// 关闭弹窗
function closeModal() {
  document.getElementById('communityModal').style.display = 'none';
}

// 格式化价格
function formatPrice(price) {
  if (!price) return '0';
  return price.toLocaleString();
}

// 初始化
function init() {
  // 渲染学校列表
  renderSchoolList();
  
  // 点击弹窗外部关闭
  window.onclick = function(event) {
    const modal = document.getElementById('communityModal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}

// 挂载函数到window对象
window.switchTab = switchTab;
window.handleDistrictClick = handleDistrictClick;
window.searchNearby = searchNearby;
window.clearSearch = clearSearch;
window.showCommunityDetail = showCommunityDetail;
window.closeModal = closeModal;
window.filterSchoolType = filterSchoolType;
window.showSchoolTypeInResult = showSchoolTypeInResult;

// 学校类型筛选
let currentSchoolType = '小学';

function filterSchoolType(type) {
  currentSchoolType = type;
  
  document.querySelectorAll('.type-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[onclick="filterSchoolType('${type}')"]`).classList.add('active');
  
  const list = document.getElementById('schoolList');
  const districtName = currentDistrict || '全部区域';
  
  document.getElementById('schoolTitle').textContent = `${districtName} - ${type}`;
  
  let filteredSchools = schools.filter(s => s.type === type);
  
  if (currentDistrict) {
    filteredSchools = filteredSchools.filter(s => s.district === currentDistrict);
  }
  
  if (filteredSchools.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🏫</div>
        <p>暂无${type}数据</p>
      </div>
    `;
    return;
  }
  
  list.innerHTML = filteredSchools.map(s => `
    <div class="list-item">
      <div class="list-item-header">
        <span class="list-item-name">${s.name}</span>
        <span class="school-type ${s.type}">${s.type}</span>
      </div>
      <div class="list-item-address">📍 ${s.address}</div>
      <div class="list-item-meta">
        <span>区域: ${s.district}</span>
        ${s.level ? `<span>级别: ${s.level}</span>` : ''}
        ${s.nature ? `<span>性质: ${s.nature}</span>` : ''}
      </div>
    </div>
  `).join('');
}

// 将函数挂载到window对象，供HTML调用
window.switchTab = switchTab;
window.handleDistrictClick = handleDistrictClick;
window.searchNearby = searchNearby;
window.showCommunityDetail = showCommunityDetail;
window.closeModal = closeModal;
window.filterSchoolType = filterSchoolType;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
