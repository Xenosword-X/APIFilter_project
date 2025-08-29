declare const axios: any;
// 介面定義資料結構
interface CropData {
  作物名稱?: string;
  市場名稱: string;
  上價?: string;
  中價?: string;
  下價?: string;
  平均價?: string;
  交易量?: string;
  種類代碼?: string;
}

// DOM 元素選取
const apiUrl:string = 'https://hexschool.github.io/js-filter-data/data.json';
const showList = document.querySelector<HTMLTableSectionElement>('.showList');
const cropInput = document.querySelector<HTMLInputElement>('#crop');
const searchButton = document.querySelector<HTMLButtonElement>('.search');
const buttonGroup = document.querySelector<HTMLDivElement>('.button-group');
const buttons = document.querySelectorAll<HTMLButtonElement>('.btn-type');
const sortSelect = document.querySelector<HTMLSelectElement>('.sort-select');
const mobileSelect = document.querySelector<HTMLSelectElement>('.mobile-select');
const sortIcons = document.querySelectorAll<HTMLElement>('.sort-advanced i');

// 資料儲存
let rawData: CropData[] = [];
let currentData: CropData[] = [];

// 對照欄位文字與資料欄位的對應
const sortKeyMap: { [key: string]: keyof CropData } = {
  '依上價排序': '上價',
  '依中價排序': '中價',
  '依下價排序': '下價',
  '依平均價排序': '平均價',
  '依交易量排序': '交易量',
};

// 取得 API 資料
axios.get(apiUrl)
  .then((response: { data: CropData[] }) => {
    rawData = response.data ?? [];
  })
  .catch((error: unknown) => {
    alert("伺服器存取失敗，請稍後再試");
    console.error('API false', error);
  });

// 渲染表格資料
function renderTable(data: CropData[]): void {
  if (!showList) return;
  if (data.length === 0) {
    showList.innerHTML = `<tr><td colspan="7" class="text-center p-3">查詢不到當日的交易資訊QQ</td></tr>`;
    return;
  }
  const str = data.map((item) => {
    return `
      <tr>
        <td>${item.作物名稱 || '無資料'}</td>
        <td>${item.市場名稱}</td>
        <td>${item.上價 || '-'}</td>
        <td>${item.中價 || '-'}</td>
        <td>${item.下價 || '-'}</td>
        <td>${item.平均價 || '-'}</td>
        <td>${item.交易量 || '-'}</td>
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
    const filteredData = rawData.filter((item) =>
      item.作物名稱 && item.作物名稱.includes(searchTerm)
    );
    currentData = filteredData;
    renderTable(currentData);
  });
}

// 按鈕篩選
if (buttonGroup) {
  buttonGroup.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const type = target.getAttribute('data-type');
    if (!type) return;
    if (type === 'N01') {
      currentData = [...rawData];
    } else {
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
function sortedRenderData(type: string): void {
  const key = sortKeyMap[type];
  if (!key) return;
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
    const target = e.target as HTMLSelectElement;
    const type = target.value;
    if (type === '排序篩選') return;
    sortedRenderData(type);
  });
}

// 手機版排序事件綁定
if (mobileSelect) {
  mobileSelect.addEventListener('change', (e) => {
    const target = e.target as HTMLSelectElement;
    const type = target.value;
    if (type === '排序') return;
    sortedRenderData(type);
  });
}

// 上下箭頭排序
sortIcons.forEach((icon) => {
  icon.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const key = target.getAttribute('data-price') as keyof CropData | null;
    const sortOrder = target.getAttribute('data-sort');
    if (!key || !sortOrder) return;
    const filteredData = currentData.filter((item) => item[key] && item[key] !== '-');
    filteredData.sort((a, b) => {
      const aVal = Number(a[key]);
      const bVal = Number(b[key]);
      if (sortOrder === 'up') {
        return aVal - bVal;
      } else {
        return bVal - aVal;
      }
    });
    renderTable(filteredData);
  });
});