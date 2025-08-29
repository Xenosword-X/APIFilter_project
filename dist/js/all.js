"use strict";
// DOM 元素選取
const apiUrl = 'https://hexschool.github.io/js-filter-data/data.json';
const showList = document.querySelector('.showList');
const cropInput = document.querySelector('#crop');
const searchButton = document.querySelector('.search');
const buttonGroup = document.querySelector('.button-group');
const buttons = document.querySelectorAll('.btn-type');
const sortSelect = document.querySelector('.sort-select');
const mobileSelect = document.querySelector('.mobile-select');
const sortIcons = document.querySelectorAll('.sort-advanced i');
// 資料儲存
let rawData = [];
let currentData = [];
// 對照欄位文字與資料欄位的對應
const sortKeyMap = {
    '依上價排序': '上價',
    '依中價排序': '中價',
    '依下價排序': '下價',
    '依平均價排序': '平均價',
    '依交易量排序': '交易量',
};
// 取得 API 資料
axios.get(apiUrl)
    .then((response) => {
    var _a;
    rawData = (_a = response.data) !== null && _a !== void 0 ? _a : [];
})
    .catch((error) => {
    alert("伺服器存取失敗，請稍後再試");
    console.error('API false', error);
});
// 渲染表格資料
function renderTable(data) {
    if (!showList)
        return;
    if (data.length === 0) {
        showList.innerHTML = `<tr><td colspan="7" class="text-center p-3">查詢不到當日的交易資訊QQ</td></tr>`;
        return;
    }
    const str = data.map((item) => {
        const { 作物名稱, 市場名稱, 上價, 中價, 下價, 平均價, 交易量 } = item;
        return `
      <tr>
        <td>${作物名稱 || '無資料'}</td>
        <td>${市場名稱}</td>
        <td>${上價 || '-'}</td>
        <td>${中價 || '-'}</td>
        <td>${下價 || '-'}</td>
        <td>${平均價 || '-'}</td>
        <td>${交易量 || '-'}</td>
      </tr>
    `;
    }).join('');
    showList.innerHTML = str;
}
// 搜尋列篩選
if (searchButton && cropInput) {
    searchButton.addEventListener('click', () => {
        const searchTerm = cropInput.value.trim();
        if (searchTerm === '') {
            alert('請輸入農作物名稱');
            return;
        }
        const filteredData = rawData.filter((item) => item.作物名稱 && item.作物名稱.includes(searchTerm));
        currentData = filteredData;
        renderTable(currentData);
    });
}
// 按鈕篩選
if (buttonGroup) {
    buttonGroup.addEventListener('click', (e) => {
        const target = e.target;
        const type = target.getAttribute('data-type');
        if (!type)
            return;
        if (type === 'N01') {
            currentData = [...rawData];
        }
        else {
            currentData = rawData.filter((item) => item.種類代碼 === type);
        }
        renderTable(currentData);
    });
}
// 按鈕 active 效果
buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        buttons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
    });
});
// 排序渲染
function sortedRenderData(type) {
    const key = sortKeyMap[type];
    if (!key)
        return;
    const filteredData = currentData.filter((item) => item[key] && item[key] !== '-');
    filteredData.sort((a, b) => {
        const aVal = Number(a[key]);
        const bVal = Number(b[key]);
        return aVal - bVal;
    });
    renderTable(filteredData);
}
// 桌面版排序事件綁定
if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
        const target = e.target;
        const type = target.value;
        if (type === '排序篩選')
            return;
        sortedRenderData(type);
    });
}
// 手機版排序事件綁定
if (mobileSelect) {
    mobileSelect.addEventListener('change', (e) => {
        const target = e.target;
        const type = target.value;
        if (type === '排序')
            return;
        sortedRenderData(type);
    });
}
// 上下箭頭排序
sortIcons.forEach((icon) => {
    icon.addEventListener('click', (e) => {
        const target = e.target;
        const key = target.getAttribute('data-price');
        const sortOrder = target.getAttribute('data-sort');
        if (!key || !sortOrder)
            return;
        const filteredData = currentData.filter((item) => item[key] && item[key] !== '-');
        filteredData.sort((a, b) => {
            const aVal = Number(a[key]);
            const bVal = Number(b[key]);
            if (sortOrder === 'up') {
                return aVal - bVal;
            }
            else {
                return bVal - aVal;
            }
        });
        renderTable(filteredData);
    });
});
