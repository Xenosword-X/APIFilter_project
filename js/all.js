//串接遠端API https://hexschool.github.io/js-filter-data/data.json
const apiUrl = 'https://hexschool.github.io/js-filter-data/data.json';
const showList = document.querySelector('.showList');
let rawData=[]; //存入API全部資料
let currentData=[]; //存入按鈕與搜尋列篩選後的資料
axios.get(apiUrl)
  .then(function(response) {
    rawData = response.data;
    //renderTable(rawData);
  })
  .catch(function(error) {
    alert("伺服器存取失敗，請稍後再試");
    console.error('API false', error);
  });

//資料渲染
function renderTable(data){
    let str="";
    data.forEach(function(item){
        str+=`
            <tr>
                <td>${item.作物名稱 || '無資料'}</td>
                <td>${item.市場名稱}</td>
                <td>${item.上價 || '-'}</td>
                <td>${item.中價 || '-'}</td>
                <td>${item.下價 || '-'}</td>
                <td>${item.平均價 || '-'}</td>
                <td>${item.交易量 || '-'}</td>
            </tr>
        `
    })
    showList.innerHTML = str;
}

//搜尋列篩選
const crop=document.querySelector('#crop');
const search=document.querySelector('.search');
search.addEventListener('click',function(e){
    if(crop.value.trim()==""){
        alert("請輸入農作物名稱");
        return;
    }
    const filterData=rawData.filter(function(item){
        return item.作物名稱 && item.作物名稱.includes(crop.value.trim());
    })
    if (filterData.length === 0) { //如果搜尋到0筆就顯示查無資料
        showList.innerHTML = `<tr><td colspan="7" class="text-center p-3">查詢不到當日的交易資訊QQ</td></tr>`;
    } else {
        currentData=filterData; //篩選後存入全域變數中，以供排序來使用
        renderTable(filterData);
    }
})

//按鈕篩選 (比較種類代碼: N04 N05 N06)
const button_group=document.querySelector('.button-group');
button_group.addEventListener("click",function(e){
    const type=e.target.getAttribute("data-type"); //紀錄點擊到的按鈕type屬性N01 N04 N05 N06
    if(type==="N01"){
        renderTable(rawData);
        return;
    }
    const filterData=rawData.filter(function(item){
        return item.種類代碼===type;
    }) 
    currentData=filterData; //篩選後存入全域變數中，以供排序來使用
    renderTable(filterData);
})
//按鈕active效果
const buttons = document.querySelectorAll(".btn-type");
buttons.forEach(function(btn) {
    btn.addEventListener("click", function() {
        buttons.forEach((b) => b.classList.remove("active")); // 移除所有按鈕的 active
        btn.classList.add("active"); // 為目前點擊的按鈕加上 active
    });
});


//排序篩選
//對照欄位文字與資料欄位的對應
const sortKeyMap = {
    "依上價排序": "上價",
    "依中價排序": "中價",
    "依下價排序": "下價",
    "依平均價排序": "平均價",
    "依交易量排序": "交易量",
};
//桌面版事件綁定
const sort_select=document.querySelector('.sort-select');
sort_select.addEventListener('change',function(e){
    const type=e.target.value;
    if(type==="排序篩選"){
        return;
    }
    sortedRenderData(type);    
})
//手機版事件綁定
const mobile_select=document.querySelector('.mobile-select');
mobile_select.addEventListener("change",function(e){
    const type=e.target.value;
    if(type==="排序"){
        return;
    }
    sortedRenderData(type);
})
//排序渲染
function sortedRenderData(type){
    const key = sortKeyMap[type]; // 取出點擊屬性記載到key變數裡，用物件的中括號屬性存取方式，不能用點記法
    // 過濾出有該欄位資料的項目，並轉為數字後排序
    const sortedData = currentData.filter(function(item) { 
        return item[key] && item[key] !== "-"; //過濾掉空值與"-"的資料
    })
    sortedData.sort(function(a, b) {
        return Number(a[key]) - Number(b[key]); // 由小至大依序排列
    });
    renderTable(sortedData);
}

//上下箭頭排序
const sortedkey=document.querySelectorAll('.sort-advanced i');
sortedkey.forEach(function(iconkey){
    iconkey.addEventListener('click',function(e){
        const key=e.target.getAttribute("data-price");
        const sortOrder = e.target.getAttribute('data-sort');
        if (!key || !sortOrder) return;
        //過濾空值和 "-"
        const filteredData = currentData.filter(function(item) {
            return item[key] && item[key] !== "-";
        });
        //排序
        filteredData.sort(function(a,b){
            const aVal=Number(a[key]);
            const bVal=Number(b[key]);
            if(sortOrder=="up"){
                return aVal - bVal; // 升冪
            }else{
                return bVal - aVal; // 降冪
            }
        })
        //選染結果
        renderTable(filteredData);
    })
})


    
