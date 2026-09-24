const SUPABASE_URL = "https://sfiinqqhyugnkbbgvyyu.supabase.co";
const SUPABASE_KEY = "sb_publishable_hnJScI34tydXdmzeMY1tHw_hlhNnIT3";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const KEY = 'trienLifeV2';

const defaultData = {
    wallets: [
        {id:1,name:'Ví ngân hàng',sub:'Vietcombank',balance:5200000,icon:'🏦',cls:'bank'},
        {id:2,name:'Tiền mặt',sub:'Tiền mặt',balance:850000,icon:'▣',cls:'cash'},
        {id:3,name:'MoMo',sub:'Ví điện tử',balance:320000,icon:'mo',cls:'momo'},
        {id:4,name:'Thẻ tín dụng',sub:'Visa',balance:1080000,icon:'▤',cls:'cardblue'}
    ],

    transactions: [
        {id:1,type:'expense',name:'Ăn trưa',cat:'Ăn uống',wallet:2,amount:50000,date:'24/09/2026',time:'12:30'},
        {id:2,type:'expense',name:'Học phí',cat:'Học tập',wallet:1,amount:200000,date:'24/09/2026',time:'09:15'},
        {id:3,type:'income',name:'Lương',cat:'Thu nhập',wallet:1,amount:4000000,date:'23/09/2026',time:'08:00'},
        {id:4,type:'expense',name:'Mua sách',cat:'Học tập',wallet:3,amount:120000,date:'18/09/2026',time:'16:20'},
        {id:5,type:'expense',name:'Đi cafe',cat:'Giải trí',wallet:2,amount:85000,date:'16/09/2026',time:'14:10'}
    ],

    tasks: [
        {id:1,name:'Học DSA',time:'13:30',date:'24/09/2026',done:true,cls:'green'},
        {id:2,name:'Làm bài C++',time:'15:00',date:'24/09/2026',done:false,cls:'blue'},
        {id:3,name:'Tập thể dục',time:'18:30',date:'24/09/2026',done:false,cls:'pink'},
        {id:4,name:'Đọc sách',time:'20:00',date:'24/09/2026',done:false,cls:'purple'}
    ],

    settings: {
        hide:false,
        notify:true,
        dark:false
    }
};

let data =
    JSON.parse(localStorage.getItem(KEY) || 'null')
    || structuredClone(defaultData);

let page = 'home';

let timerSec = 1500;
let timerTotal = 1500;
let timerInt = null;

let taskTab = 'work';
let moneyVisible = true;

let scheduleTab = 'work';
let statsTab = 'category';
let financeTab = 'overview';
let selectedDate = 24;

let timerMode = 'countdown';
let reminderCheckInt = null;


/* =========================
   SUPABASE AUTH
========================= */

async function checkSupabase() {

    const {
        data: sessionData,
        error
    } = await supabaseClient.auth.getSession();

    if(error) {
        console.error("Supabase lỗi:", error);
        return null;
    }

    if(sessionData.session) {

        console.log(
            "Supabase đã kết nối - User:",
            sessionData.session.user.email
        );

        return sessionData.session;

    } else {

        console.log(
            "Supabase đã kết nối - Chưa đăng nhập"
        );

        return null;
    }
}


async function login(email,password) {

    const {
        data,
        error
    } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if(error) {

        console.error(
            "Login error:",
            error
        );

        toast(
            'Đăng nhập thất bại: ' +
            error.message
        );

        return false;
    }

    console.log(
        "Đăng nhập thành công:",
        data.user
    );

    toast('Đăng nhập thành công');

    return true;
}


async function getCurrentUser() {

    const {
        data: { user },
        error
    } = await supabaseClient.auth.getUser();

    if(error) {

        console.error(
            "Lỗi lấy user:",
            error
        );

        return null;
    }

    if(user) {

        console.log(
            "Đang đăng nhập:",
            user.email
        );

    } else {

        console.log(
            "Chưa đăng nhập"
        );
    }

    return user;
}


async function logoutSupabase() {

    const {
        error
    } = await supabaseClient.auth.signOut();

    if(error) {

        console.error(
            "Đăng xuất lỗi:",
            error
        );

        toast(
            "Đăng xuất thất bại"
        );

        return;
    }

    toast(
        "Đã đăng xuất"
    );

    page = 'home';

    setTimeout(() => {
        render();
    },300);
}


/* =========================
   LOGIN PAGE
========================= */

function loginPage() {

    return `
    <div class="login-screen">

        <div class="login-logo">

            <div class="login-logo-icon">
                T
            </div>

            <h1>
                Triển Life
            </h1>

            <p>
                Kỷ luật hơn, tự do ngày mai
            </p>

        </div>


        <div class="login-box">

            <h2>
                Đăng nhập
            </h2>

            <p>
                Đăng nhập để đồng bộ dữ liệu của bạn
            </p>


            <div class="field">

                <label>
                    Email
                </label>

                <input
                    id="loginEmail"
                    class="input"
                    type="email"
                    autocomplete="email"
                    placeholder="Nhập email">

            </div>


            <div class="field">

                <label>
                    Mật khẩu
                </label>

                <input
                    id="loginPassword"
                    class="input"
                    type="password"
                    autocomplete="current-password"
                    placeholder="Nhập mật khẩu"
                    onkeydown="if(event.key==='Enter') handleLogin()">

            </div>


            <button
                class="primary full"
                onclick="handleLogin()">

                Đăng nhập

            </button>

        </div>

    </div>`;
}


async function handleLogin() {

    const emailInput =
        document.getElementById('loginEmail');

    const passwordInput =
        document.getElementById('loginPassword');


    const email =
        emailInput
        ? emailInput.value.trim()
        : '';


    const password =
        passwordInput
        ? passwordInput.value
        : '';


    if(!email) {

        toast(
            'Nhập email'
        );

        return;
    }


    if(!password) {

        toast(
            'Nhập mật khẩu'
        );

        return;
    }


    const ok =
        await login(
            email,
            password
        );


    if(ok) {

        page = 'home';

        render();
    }
}


/* =========================
   AUTH STATE
========================= */

supabaseClient.auth.onAuthStateChange(
    (event,session) => {

        console.log(
            "Auth event:",
            event
        );


        if(session) {

            console.log(
                "User hiện tại:",
                session.user.email
            );

        } else {

            console.log(
                "Không có user đăng nhập"
            );
        }


        if(
            event === 'SIGNED_IN' ||
            event === 'SIGNED_OUT'
        ) {

            render();
        }

    }
);


/* =========================
   LOCAL DATA
========================= */

const money = n =>
    new Intl.NumberFormat('vi-VN').format(n) + 'đ';


const save = () =>
    localStorage.setItem(
        KEY,
        JSON.stringify(data)
    );


const esc = s =>
    String(s).replace(
        /[&<>"']/g,
        m => ({
            '&':'&amp;',
            '<':'&lt;',
            '>':'&gt;',
            '"':'&quot;',
            "'":'&#039;'
        }[m])
    );


function total() {

    return data.wallets.reduce(
        (s,w) =>
            s + Number(w.balance || 0),
        0
    );
}


function wallet(id) {

    return data.wallets.find(
        w => w.id == id
    );
}


function dateKey(
    day,
    month=9,
    year=2026
) {

    return `${String(day).padStart(2,'0')}/${String(month).padStart(2,'0')}/${year}`;
}


function tasksForDate(day) {

    return data.tasks.filter(
        t =>
            (t.date || '24/09/2026')
            === dateKey(day)
    );
}


function ensureTaskDates() {

    let changed = false;

    data.tasks.forEach(t => {

        if(!t.date) {

            t.date =
                '24/09/2026';

            changed = true;
        }

    });

    if(changed)
        save();
}


function fmt(v) {

    return moneyVisible
        ? money(v)
        : '••••••';
}


/* =========================
   NAVIGATION
========================= */

function navIcon(name) {

    const icons = {

        home:
        '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6"/></svg>',

        schedule:
        '<svg viewBox="0 0 24 24"><rect x="4" y="5.5" width="16" height="15" rx="2"/><path d="M8 3.5v4M16 3.5v4M4 10h16"/><path d="M8 13h2M14 13h2M8 17h2"/></svg>',

        finance:
        '<svg viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M3.5 9h17M7 14h3M15 14h2"/></svg>',

        timer:
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="7.5"/><path d="M12 13V9.5M9.5 3.5h5M12 5.5v-2M18 7l1.5-1.5"/></svg>',

        settings:
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.42 1.42-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21.6h-2v-.08a1.7 1.7 0 0 0-1.03-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.42-1.42.06-.06A1.7 1.7 0 0 0 9.4 15a1.7 1.7 0 0 0-1.56-1.03H7.6v-2h.24A1.7 1.7 0 0 0 9.4 11a1.7 1.7 0 0 0-.34-1.88L9 9.06l1.42-1.42.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.42 1.42-.06.06A1.7 1.7 0 0 0 19.4 11a1.7 1.7 0 0 0 1.56 1.03h.24v2h-.24A1.7 1.7 0 0 0 19.4 15Z"/></svg>'
    };

    return icons[name] || '';
}


function nav() {

    let items = [
        ['home','Trang chủ'],
        ['schedule','Lịch trình'],
        ['finance','Tài chính'],
        ['timer','Hẹn giờ'],
        ['settings','Cài đặt']
    ];


    document.getElementById(
        'bottomNav'
    ).innerHTML =

        items.map(x =>

            `<button
                class="${page===x[0]?'active':''}"
                aria-label="${x[1]}"
                onclick="go('${x[0]}')">

                <span class="nav-icon">
                    ${navIcon(x[0])}
                </span>

                <small>
                    ${x[1]}
                </small>

            </button>`

        ).join('');
}


function go(p) {

    page = p;

    render();

    window.scrollTo({
        top:0,
        behavior:'smooth'
    });
}


/* =========================
   RENDER
========================= */

function render() {

    ensureTaskDates();

    const screen =
        document.getElementById('screen');

    const bottomNav =
        document.getElementById('bottomNav');


    if(!screen || !bottomNav)
        return;


    supabaseClient.auth
        .getSession()
        .then(({data:sessionData,error}) => {

            if(error) {

                console.error(
                    "Lỗi kiểm tra session:",
                    error
                );

                return;
            }


            if(!sessionData.session) {

                bottomNav.innerHTML = '';

                screen.innerHTML =
                    loginPage();

                document.body.classList.remove(
                    'dark'
                );

                return;
            }


            nav();


            screen.innerHTML =

                page === 'home'
                ? home()

                : page === 'schedule'
                ? schedule()

                : page === 'timer'
                ? timerPage()

                : page === 'finance'
                ? finance()

                : page === 'settings'
                ? settings()

                : '';


            if(data.settings.dark) {

                document.body.classList.add(
                    'dark'
                );

            } else {

                document.body.classList.remove(
                    'dark'
                );
            }

        })
        .catch(error => {

            console.error(
                "Render lỗi:",
                error
            );

        });
}


/* =========================
   HOME
========================= */

function home() {

    return `
    <div class="screen">

        <div class="hero">

            <h1>
                Triển Life
            </h1>

            <p>
                Kỷ luật hơn, tự do ngày mai
            </p>

        </div>


        <div class="hello">

            <b>
                Xin chào, Triển 👋
            </b>

            <small>
                Thứ Năm, 24 tháng 9, 2026
            </small>

            <div class="quote">
                “Mỗi ngày là một cơ hội để tốt hơn so với chính mình.”
            </div>

        </div>


        <div class="section-head">

            <h3>
                Hôm nay (4)
            </h3>

            <button onclick="go('schedule')">
                Xem tất cả ›
            </button>

        </div>


        ${data.tasks.map(
            t => taskHTML(t)
        ).join('')}


        <div class="section-head">

            <h3>
                Hẹn giờ
            </h3>

        </div>


        <div class="mini-timer">

            <div class="timer-icon">
                ◷
            </div>

            <div class="grow">

                <b>
                    Phiên tập trung 25 phút
                </b>

                <small>
                    ${timerInt?'Đang chạy':'Sẵn sàng'}
                </small>

            </div>

            <button
                class="play"
                onclick="go('timer')">

                ▶

            </button>

        </div>


        <div class="section-head">

            <h3>
                Tài chính tháng này
            </h3>

            <button onclick="go('finance')">
                Xem chi tiết ›
            </button>

        </div>


        <div class="finance-summary">

            <div>

                <small>
                    Thu nhập
                </small>

                <b class="green-t">
                    4.000.000đ
                </b>

            </div>


            <div>

                <small>
                    Chi tiêu
                </small>

                <b class="red-t">
                    1.250.000đ
                </b>

            </div>


            <div>

                <small>
                    Số dư
                </small>

                <b>
                    ${money(total())}
                </b>

            </div>

        </div>

    </div>`;
}


function taskHTML(t) {

    return `
    <div
        class="task ${t.cls}"
        onclick="toggleTask(${t.id})">

        <span class="check ${t.done?'done':''}">
            ${t.done?'✓':''}
        </span>

        <div>

            <div class="name">
                ${esc(t.name)}
            </div>

            <div class="time">
                ${t.time}
            </div>

        </div>

        <span class="dots">
            ⋮
        </span>

    </div>`;
}


/* =========================
   SCHEDULE
========================= */

function schedule() {

    return `
    <div class="screen">

        <div class="top">

            <h1>
                Lịch trình
            </h1>

            <button
                class="primary"
                style="width:30px;height:30px;padding:0;border-radius:50%"
                onclick="taskModal()">

                ＋

            </button>

        </div>


        <div class="tabs">

            <button
                class="${scheduleTab==='work'?'active':''}"
                onclick="setScheduleTab('work')">

                Công việc

            </button>


            <button
                class="${scheduleTab==='day'?'active':''}"
                onclick="setScheduleTab('day')">

                Lịch ngày

            </button>


            <button
                class="${scheduleTab==='reminder'?'active':''}"
                onclick="setScheduleTab('reminder')">

                Nhắc việc

            </button>

        </div>


        ${
            scheduleTab==='work'
            ? scheduleWork()

            : scheduleTab==='day'
            ? scheduleDay()

            : scheduleReminder()
        }

    </div>`;
}


function setScheduleTab(tab) {

    scheduleTab = tab;

    render();
}


function scheduleWork() {

    return `
    <div class="search">

        <span>
            ⌕
        </span>

        <input
            id="searchTask"
            oninput="filterTasks()"
            placeholder="Tìm kiếm công việc...">

    </div>


    <div class="date-strip">

        ${
            ['T2','T3','T4','T5','T6','T7','CN']
                .map((d,i) =>
                    `<button
                        class="day ${i===2?'active':''}"
                        onclick="selectScheduleDate(${22+i})">

                        ${d}

                        <b>
                            ${22+i}
                        </b>

                    </button>`
                )
                .join('')
        }

    </div>


    <div class="section-head">

        <h3>
            Hôm nay (${data.tasks.length})
        </h3>

    </div>


    <div id="taskList">

        ${data.tasks.map(
            taskHTML
        ).join('')}

    </div>


    <button
        class="primary full"
        onclick="taskModal()">

        ＋ Thêm công việc

    </button>`;
}


function scheduleDay() {

    let list =
        tasksForDate(
            selectedDate
        );


    return `
    <div class="page-calendar">

        <div class="calendar-head">

            <button onclick="changeMonth(-1)">
                ‹
            </button>

            <b>
                Tháng 9, 2026
            </b>

            <button onclick="changeMonth(1)">
                ›
            </button>

        </div>


        <div class="calendar-grid">

            ${
                ['T2','T3','T4','T5','T6','T7','CN']
                    .map(
                        x =>
                        `<span>${x}</span>`
                    )
                    .join('')
            }


            ${
                Array.from(
                    {length:35},
                    (_,i) => {

                        let day = i-1;

                        if(
                            day<1 ||
                            day>30
                        )
                            return '<span></span>';

                        return `
                        <button
                            onclick="selectScheduleDate(${day})"
                            class="${day===selectedDate?'today':''}">

                            ${day}

                        </button>`;
                    }
                ).join('')
            }

        </div>


        <div class="timeline">

            <div>

                <b style="font-size:11px">

                    ${
                        selectedDate===24
                        ? 'Hôm nay, '
                        : ''
                    }

                    ${String(selectedDate).padStart(2,'0')}/09/2026

                </b>


                <small
                    style="display:block;color:#8a96aa;font-size:9px;margin-top:4px">

                    ${
                        list.length
                        ? list.length+' sự kiện'
                        : 'Không có sự kiện'
                    }

                </small>

            </div>


            ${
                list.map(
                    t =>
                    `<button
                        class="timeline-row"
                        onclick="editTask(${t.id})">

                        <span class="dot ${
                            t.cls==='blue'
                            ? 'blue'
                            : t.cls==='pink'
                            ? 'pink'
                            : t.cls==='purple'
                            ? 'purple'
                            : ''
                        }"></span>

                        <span
                            style="width:42px;color:#6e7a8d">

                            ${t.time}

                        </span>

                        <b>
                            ${esc(t.name)}
                        </b>

                    </button>`
                ).join('')

                ||

                '<div class="empty">Không có sự kiện trong ngày này</div>'
            }

        </div>

    </div>`;
}


function scheduleReminder() {

    return `
    <div class="reminder-box">

        <div class="reminder-head">

            <div>

                <b>
                    Nhắc việc
                </b>

                <small>
                    Những việc cần nhắc bạn trong ngày
                </small>

            </div>


            <button
                class="primary"
                style="width:auto;padding:8px 14px"
                onclick="reminderModal()">

                ＋ Thêm

            </button>

        </div>


        ${
            data.tasks.map(
                t =>
                `<div class="reminder-row">

                    <div
                        class="check ${t.done?'done':''}"
                        onclick="toggleTask(${t.id})">

                        ${t.done?'✓':''}

                    </div>


                    <div class="grow">

                        <b>
                            ${esc(t.name)}
                        </b>

                        <small>
                            Nhắc lúc ${t.time}
                        </small>

                    </div>


                    <button
                        onclick="editTask(${t.id})">

                        ⋮

                    </button>

                </div>`
            ).join('')

            ||

            '<div class="empty">Chưa có nhắc việc</div>'
        }

    </div>`;
}


function selectScheduleDate(d) {

    selectedDate =
        Number(d);

    scheduleTab =
        'day';

    render();

    toast(
        `Đã chọn ngày ${String(selectedDate).padStart(2,'0')}/09/2026`
    );
}


function changeMonth(delta) {

    toast(
        'Bản lịch tháng hiện tại là 09/2026'
    );
}


function reminderModal() {

    taskModal();
}


function editTask(id) {

    let t =
        data.tasks.find(
            x => x.id === id
        );

    if(!t)
        return;


    openSheet(`

        <div class="close-row">

            <h3>
                Sửa công việc
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="field">

            <label>
                Tên công việc
            </label>

            <input
                id="editTaskName"
                class="input"
                value="${esc(t.name)}">

        </div>


        <div class="field">

            <label>
                Ngày
            </label>

            <input
                id="editTaskDate"
                type="date"
                class="input"
                value="${(t.date||'24/09/2026')
                    .split('/')
                    .reverse()
                    .join('-')}">

        </div>


        <div class="field">

            <label>
                Thời gian
            </label>

            <input
                id="editTaskTime"
                type="time"
                class="input"
                value="${t.time}">

        </div>


        <button
            class="primary full"
            onclick="updateTask(${id})">

            Lưu thay đổi

        </button>


        <button
            class="danger full"
            onclick="removeTask(${id})">

            Xóa công việc

        </button>

    `);
}


function updateTask(id) {

    let t =
        data.tasks.find(
            x => x.id === id
        );

    if(!t)
        return;


    t.name =
        document
            .getElementById('editTaskName')
            .value.trim()
        || t.name;


    t.time =
        document
            .getElementById('editTaskTime')
            .value
        || t.time;


    let d =
        document
            .getElementById('editTaskDate')
            .value;


    if(d) {

        let [
            y,
            m,
            day
        ] = d.split('-');

        t.date =
            `${day}/${m}/${y}`;
    }


    save();

    closeSheet();

    render();

    toast(
        'Đã cập nhật công việc'
    );
}


function removeTask(id) {

    if(!confirm(
        'Xóa công việc này?'
    ))
        return;


    data.tasks =
        data.tasks.filter(
            t => t.id !== id
        );


    save();

    closeSheet();

    render();

    toast(
        'Đã xóa công việc'
    );
}


function filterTasks() {

    let q =
        document
            .getElementById('searchTask')
            .value
            .toLowerCase();


    document
        .getElementById('taskList')
        .innerHTML =

        data.tasks
            .filter(
                t =>
                    t.name
                        .toLowerCase()
                        .includes(q)
            )
            .map(taskHTML)
            .join('');
}


function toggleTask(id) {

    let t =
        data.tasks.find(
            x => x.id === id
        );

    if(!t)
        return;


    t.done =
        !t.done;


    save();

    render();


    toast(
        t.done
        ? 'Đã hoàn thành'
        : 'Đã bỏ hoàn thành'
    );
}


function taskModal() {

    openSheet(`

        <div class="close-row">

            <h3>
                Thêm công việc
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="field">

            <label>
                Tên công việc
            </label>

            <input
                id="taskName"
                class="input"
                placeholder="Ví dụ: Học DSA">

        </div>


        <div class="field">

            <label>
                Thời gian
            </label>

            <input
                id="taskTime"
                type="time"
                class="input"
                value="15:00">

        </div>


        <button
            class="primary full"
            style="margin-top:16px"
            onclick="addTask()">

            Thêm công việc

        </button>

    `);
}


function addTask() {

    let n =
        document
            .getElementById('taskName')
            .value
            .trim();


    if(!n)
        return toast(
            'Nhập tên công việc'
        );


    data.tasks.push({

        id:
            Date.now(),

        name:
            n,

        time:
            document
                .getElementById('taskTime')
                .value,

        date:
            dateKey(
                selectedDate
            ),

        done:
            false,

        cls:
            'blue'

    });


    save();

    closeSheet();

    render();

    toast(
        'Đã thêm công việc'
    );
}


/* =========================
   TIMER
========================= */

function timerPage() {

    if(timerInt)
        return runningTimer();


    return `
    <div class="screen">

        <div class="top">

            <h1>
                Hẹn giờ
            </h1>

            <button class="more">
                ⋮
            </button>

        </div>


        <div class="timer-select">

            <div class="timer-toggle">

                <button
                    class="${timerMode==='countdown'?'active':''}"
                    onclick="setTimerMode('countdown')">

                    Đếm ngược

                </button>


                <button
                    class="${timerMode==='reminder'?'active':''}"
                    onclick="setTimerMode('reminder')">

                    Nhắc việc

                </button>

            </div>


            ${
                timerMode==='countdown'
                ? timerCountdownForm()
                : timerReminderForm()
            }

        </div>

    </div>`;
}


function setTimerMode(mode) {

    timerMode =
        mode;

    render();
}


function timerCountdownForm() {

    return `
    <div class="timer-hero">

        <div class="stopwatch">
            ◷
        </div>

        <h2>
            Đặt thời gian đếm ngược
        </h2>


        <div class="free-time">

            <div>

                <label>
                    Phút
                </label>

                <input
                    id="timerMinutes"
                    type="number"
                    min="0"
                    max="9999"
                    value="${Math.floor(timerSec/60)}">

            </div>


            <span>
                :
            </span>


            <div>

                <label>
                    Giây
                </label>

                <input
                    id="timerSeconds"
                    type="number"
                    min="0"
                    max="59"
                    value="${timerSec%60}">

            </div>

        </div>


        <div class="quick-times">

            <button onclick="setTimerPreset(5)">
                5 phút
            </button>

            <button onclick="setTimerPreset(15)">
                15 phút
            </button>

            <button onclick="setTimerPreset(25)">
                25 phút
            </button>

            <button onclick="setTimerPreset(60)">
                1 giờ
            </button>

        </div>


        <label class="label">
            Tiêu đề (tùy chọn)
        </label>


        <input
            id="timerTitle"
            class="input"
            value="${esc(localStorage.getItem('timerTitle')||'')}"
            placeholder="Ví dụ: Tập trung học bài">


        <button
            class="primary green full"
            style="margin-top:14px"
            onclick="startTimer()">

            Bắt đầu

        </button>

    </div>`;
}


function setTimerPreset(min) {

    timerSec =
        min * 60;

    render();
}


function timerReminderForm() {

    let now =
        new Date();


    let date =
        now
            .toISOString()
            .slice(0,10);


    let time =
        now
            .toTimeString()
            .slice(0,5);


    return `
    <div class="timer-hero reminder-form">

        <div class="stopwatch">
            🔔
        </div>

        <h2>
            Tạo nhắc việc
        </h2>


        <label class="label">
            Nội dung
        </label>

        <input
            id="reminderTitle"
            class="input"
            placeholder="Ví dụ: Học DSA">


        <label class="label">
            Ngày
        </label>

        <input
            id="reminderDate"
            type="date"
            class="input"
            value="${date}">


        <label class="label">
            Giờ nhắc
        </label>

        <input
            id="reminderTime"
            type="time"
            class="input"
            value="${time}">


        <button
            class="primary green full"
            style="margin-top:14px"
            onclick="createReminder()">

            Đặt nhắc việc

        </button>


        <small class="hint">
            Bạn cần cho phép thông báo để nhận cảnh báo.
        </small>

    </div>`;
}


function createReminder() {

    let name =
        document
            .getElementById('reminderTitle')
            .value
            .trim();


    let d =
        document
            .getElementById('reminderDate')
            .value;


    let tm =
        document
            .getElementById('reminderTime')
            .value;


    if(!name || !d || !tm)
        return toast(
            'Hãy nhập đủ nội dung, ngày và giờ'
        );


    let [
        y,
        m,
        day
    ] = d.split('-');


    data.tasks.push({

        id:
            Date.now(),

        name,

        time:
            tm,

        date:
            `${day}/${m}/${y}`,

        done:
            false,

        cls:
            'blue'

    });


    save();

    closeSheet();

    requestNotifyPermission();

    scheduleReminderChecks();

    toast(
        'Đã tạo nhắc việc'
    );


    setTimeout(
        () => render(),
        250
    );
}


function requestNotifyPermission() {

    if(
        'Notification' in window &&
        Notification.permission === 'default'
    ) {

        Notification
            .requestPermission()
            .catch(
                () => {}
            );
    }
}


function startReminderChecks() {

    if(reminderCheckInt)
        return;


    reminderCheckInt =
        setInterval(
            checkDueReminders,
            15000
        );
}


function scheduleReminderChecks() {

    startReminderChecks();

    checkDueReminders();
}


function checkDueReminders() {

    if(!data.settings.notify)
        return;


    let now =
        new Date();


    let key =
        now.toLocaleDateString(
            'vi-VN'
        );


    let tm =
        now
            .toTimeString()
            .slice(0,5);


    data.tasks
        .filter(
            t =>
                !t.done &&
                t.date === key &&
                t.time === tm
        )
        .forEach(
            t => {

                let mark =
                    `reminder_${t.id}_${key}_${tm}`;


                if(
                    sessionStorage
                        .getItem(mark)
                )
                    return;


                sessionStorage
                    .setItem(
                        mark,
                        '1'
                    );


                notify(
                    'Triển Life',
                    `Đã đến giờ: ${t.name}`
                );

            }
        );
}


function runningTimer() {

    return `
    <div class="timer-running">

        <div class="top">

            <button onclick="stopTimer()">
                ×
            </button>

            <h1>
                Hẹn giờ
            </h1>

            <button>
                ⚙
            </button>

        </div>


        <div class="ring">

            <div class="ring-inner">

                <b>

                    ${String(
                        Math.floor(timerSec/60)
                    ).padStart(2,'0')}:${String(
                        timerSec%60
                    ).padStart(2,'0')}

                </b>

                <small>
                    Đếm ngược
                </small>

            </div>

        </div>


        <div class="running-card">

            <div class="ico">
                ◷
            </div>

            <div>

                <b>
                    ${esc(
                        localStorage.getItem(
                            'timerTitle'
                        )
                        ||
                        'Tập trung học DSA'
                    )}
                </b>

                <small>
                    ${Math.ceil(timerTotal/60)} phút
                </small>

            </div>

        </div>


        <div class="run-actions">

            <button onclick="resetTimer()">

                ↻<br>
                Reset

            </button>


            <button
                class="pause"
                onclick="pauseTimer()">

                Ⅱ

            </button>


            <button onclick="addMinute()">

                ＋<br>
                +1 phút

            </button>

        </div>

    </div>`;
}


function startTimer() {

    let mins =
        Math.max(
            0,
            parseInt(
                document
                    .getElementById(
                        'timerMinutes'
                    )?.value
                || 0
            )
        );


    let secs =
        Math.min(
            59,
            Math.max(
                0,
                parseInt(
                    document
                        .getElementById(
                            'timerSeconds'
                        )?.value
                    || 0
                )
            )
        );


    timerSec =
        mins * 60 + secs;


    if(timerSec <= 0)
        return toast(
            'Hãy đặt thời gian lớn hơn 0'
        );


    let title =
        document
            .getElementById(
                'timerTitle'
            )
            ?.value
            .trim()
        ||
        'Tập trung học DSA';


    localStorage.setItem(
        'timerTitle',
        title
    );


    requestNotifyPermission();


    timerTotal =
        timerSec;


    clearInterval(
        timerInt
    );


    timerInt =
        setInterval(
            () => {

                timerSec--;


                if(timerSec <= 0) {

                    clearInterval(
                        timerInt
                    );

                    timerInt =
                        null;

                    timerSec =
                        0;


                    notify(
                        'Triển Life',
                        'Hẹn giờ đã kết thúc ⏰'
                    );


                    toast(
                        'Hẹn giờ đã kết thúc'
                    );
                }


                render();

            },
            1000
        );


    render();
}


function pauseTimer() {

    clearInterval(
        timerInt
    );

    timerInt =
        null;

    render();
}


function stopTimer() {

    clearInterval(
        timerInt
    );

    timerInt =
        null;


    timerSec =
        timerTotal =
        1500;


    render();
}


function resetTimer() {

    timerSec =
        timerTotal =
        1500;


    clearInterval(
        timerInt
    );


    timerInt =
        null;


    render();
}


function addMinute() {

    timerSec += 60;

    timerTotal += 60;

    render();
}


/* =========================
   FINANCE
========================= */

function finance() {

    return `
    <div class="screen">

        <div class="finance-head">

            <div class="top">

                <div>

                    <h1>
                        Tài chính
                    </h1>

                    <p>
                        Quản lý chi tiêu · Tích lũy tương lai
                    </p>

                </div>


                <button
                    class="more"
                    onclick="toast('Tùy chọn tài chính')">

                    ⋮

                </button>

            </div>


            <div class="tabs finance-tabs">

                <button
                    class="${financeTab==='overview'?'active':''}"
                    onclick="setFinanceTab('overview')">

                    Tổng quan

                </button>


                <button
                    class="${financeTab==='income'?'active':''}"
                    onclick="setFinanceTab('income')">

                    Thu / Chi

                </button>


                <button
                    class="${financeTab==='category'?'active':''}"
                    onclick="setFinanceTab('category')">

                    Danh mục

                </button>

            </div>


            ${
                financeTab==='overview'
                ? financeOverview()

                : financeTab==='income'
                ? financeIncome()

                : financeCategory()
            }

        </div>

    </div>`;
}


function setFinanceTab(tab) {

    financeTab =
        tab;

    render();
}


function financeOverview() {

    return `
    <div class="asset">

        <small>
            Tổng tài sản　◉
        </small>

        <h2>
            ${fmt(total())}
        </h2>

        <div class="change">
            ↑ +320.000đ (so với tháng trước)
        </div>

    </div>


    <div class="section-head">

        <h3>
            Các ví của tôi
        </h3>

        <button onclick="walletList()">
            + Tạo ví
        </button>

    </div>


    ${data.wallets.map(
        walletRow
    ).join('')}


    <div class="section-head">

        <h3>
            Giao dịch gần đây
        </h3>

        <button onclick="txList()">
            Xem tất cả ›
        </button>

    </div>


    ${data.transactions
        .slice(0,3)
        .map(txRow)
        .join('')}


    <div class="section-head">

        <h3>
            Thao tác nhanh
        </h3>

    </div>


    <div class="quick-grid">

        <button
            class="quick"
            onclick="txModal('income')">

            <div class="qico">
                ↗
            </div>

            <b>
                Thu
            </b>

            <small>
                Giao dịch
            </small>

        </button>


        <button
            class="quick"
            onclick="txModal('expense')">

            <div class="qico">
                ↘
            </div>

            <b>
                Chi
            </b>

            <small>
                Giao dịch
            </small>

        </button>


        <button
            class="quick"
            onclick="transferModal()">

            <div class="qico">
                ⇄
            </div>

            <b>
                Chuyển
            </b>

            <small>
                Giữa ví
            </small>

        </button>


        <button
            class="quick"
            onclick="stats()">

            <div class="qico">
                ◔
            </div>

            <b>
                Thống kê
            </b>

            <small>
                Báo cáo
            </small>

        </button>

    </div>`;
}


function financeIncome() {

    let income =
        data.transactions
            .filter(
                t =>
                    t.type === 'income'
            )
            .reduce(
                (a,t) =>
                    a+t.amount,
                0
            );


    let expense =
        data.transactions
            .filter(
                t =>
                    t.type === 'expense'
            )
            .reduce(
                (a,t) =>
                    a+t.amount,
                0
            );


    return `
    <div class="asset">

        <small>
            Số dư hiện tại
        </small>

        <h2>
            ${fmt(total())}
        </h2>

    </div>


    <div class="finance-summary">

        <div>

            <small>
                Thu nhập
            </small>

            <b class="green-t">
                ${money(income)}
            </b>

        </div>


        <div>

            <small>
                Chi tiêu
            </small>

            <b class="red-t">
                ${money(expense)}
            </b>

        </div>


        <div>

            <small>
                Chênh lệch
            </small>

            <b>
                ${money(income-expense)}
            </b>

        </div>

    </div>


    <div class="section-head">

        <h3>
            Giao dịch gần đây
        </h3>

        <button onclick="txModal('income')">
            ＋ Thêm
        </button>

    </div>


    ${data.transactions
        .map(txRow)
        .join('')}`;
}


function financeCategory() {

    return `
    <div class="section-head">

        <h3>
            Danh mục chi tiêu
        </h3>

        <button onclick="stats()">
            Thống kê ›
        </button>

    </div>


    <div class="chart-card">

        <div class="donut"></div>


        ${
            [
                ['Ăn uống',500000],
                ['Đi lại',250000],
                ['Học tập',187500],
                ['Giải trí',125000],
                ['Khác',187500]
            ]
            .map(
                (x,i) =>
                `<div class="legend-row">

                    <i class="legend-dot"></i>

                    <span style="flex:1">
                        ${x[0]}
                    </span>

                    <b>
                        ${money(x[1])}
                    </b>

                </div>`
            )
            .join('')
        }

    </div>`;
}


function walletRow(w) {

    let pct =
        total()
        ? (
            (w.balance /
            total()) * 100
        ).toFixed(1)
        : 0;


    return `
    <div
        class="wallet-row"
        onclick="walletDetail(${w.id})">

        <div class="wallet-icon ${w.cls}">
            ${w.icon}
        </div>


        <div class="wallet-main">

            <b>
                ${esc(w.name)}
            </b>

            <small>
                ${esc(w.sub)}
            </small>

        </div>


        <div class="wallet-money">

            <b>
                ${fmt(w.balance)}
            </b>

            <small>
                (= ${pct}%)
            </small>

        </div>

    </div>`;
}


function txRow(t) {

    return `
    <div class="tx-row">

        <div class="tx-icon">
            ${t.type==='income'?'↗':'●'}
        </div>


        <div class="tx-main">

            <b>
                ${esc(t.name)}
            </b>

            <small>
                ${esc(wallet(t.wallet)?.name||'')}
                · ${esc(t.cat)}
            </small>

        </div>


        <div class="tx-amount ${t.type}">
            ${t.type==='income'?'+':'-'}${money(t.amount)}
        </div>

    </div>`;
}


/* =========================
   WALLET
========================= */

function walletList() {

    openSheet(`

        <div class="close-row">

            <h3>
                Ví của tôi
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="asset">

            <small>
                Tổng tài sản　◉
            </small>

            <h2>
                ${fmt(total())}
            </h2>

        </div>


        ${data.wallets.map(
            walletRow
        ).join('')}


        <button
            class="primary full"
            style="margin-top:10px"
            onclick="closeSheet();walletModal()">

            ＋ Tạo ví mới

        </button>

    `);
}


function walletModal() {

    openSheet(`

        <div class="close-row">

            <h3>
                Tạo ví mới
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="field">

            <label>
                Tên ví
            </label>

            <input
                id="wname"
                placeholder="Ví dụ: Vietcombank, Tiền mặt...">

        </div>


        <div class="field">

            <label>
                Chọn biểu tượng
            </label>


            <div class="quick-grid">

                <button
                    class="quick"
                    onclick="pickIcon('🏦')">

                    🏦

                </button>


                <button
                    class="quick"
                    onclick="pickIcon('▣')">

                    ▣

                </button>


                <button
                    class="quick"
                    onclick="pickIcon('▤')">

                    ▤

                </button>


                <button
                    class="quick"
                    onclick="pickIcon('💳')">

                    💳

                </button>

            </div>

        </div>


        <div class="field">

            <label>
                Loại ví
            </label>


            <select id="wsub">

                <option>
                    Ví tiền mặt
                </option>

                <option>
                    Ví ngân hàng
                </option>

                <option>
                    Ví điện tử
                </option>

                <option>
                    Thẻ tín dụng
                </option>

            </select>

        </div>


        <div class="field">

            <label>
                Số dư ban đầu
            </label>

            <input
                id="wbal"
                type="number"
                placeholder="Nhập số tiền">

        </div>


        <button
            class="primary full"
            style="margin-top:15px"
            onclick="addWallet()">

            Tạo ví

        </button>

    `);
}


let picked =
    '🏦';


function pickIcon(x) {

    picked =
        x;

    toast(
        'Đã chọn '+x
    );
}


function addWallet() {

    let n =
        document
            .getElementById('wname')
            .value
            .trim();


    if(!n)
        return toast(
            'Nhập tên ví'
        );


    data.wallets.push({

        id:
            Date.now(),

        name:
            n,

        sub:
            document
                .getElementById('wsub')
                .value,

        balance:
            +document
                .getElementById('wbal')
                .value
            || 0,

        icon:
            picked,

        cls:
            'bank'

    });


    save();

    closeSheet();

    render();

    toast(
        'Đã tạo ví'
    );
}


function walletDetail(id) {

    let w =
        wallet(id);


    if(!w)
        return;


    openSheet(`

        <div class="close-row">

            <button onclick="closeSheet()">
                ‹
            </button>

            <h3>
                Quản lý ví
            </h3>

            <button>
                ⋮
            </button>

        </div>


        <div class="detail-hero">

            <b>
                ${w.icon}
                ${esc(w.name)}　◉
            </b>

            <small>
                ${esc(w.sub)}
            </small>

            <h2>
                ${fmt(w.balance)}
            </h2>

        </div>


        <div class="icon-actions">

            <button
                class="icon-action"
                onclick="editWallet(${id})">

                <div class="circle-action">
                    ✎
                </div>

                Sửa

            </button>


            <button
                class="icon-action"
                onclick="txModal('income',${id})">

                <div class="circle-action">
                    ◉
                </div>

                Nạp tiền

            </button>


            <button
                class="icon-action"
                onclick="txModal('expense',${id})">

                <div class="circle-action">
                    ▣
                </div>

                Rút tiền

            </button>


            <button
                class="icon-action"
                onclick="deleteWallet(${id})">

                <div class="circle-action">
                    ♲
                </div>

                Xóa

            </button>

        </div>


        <h3 style="font-size:12px">
            Giao dịch gần đây
        </h3>


        ${
            data.transactions
                .filter(
                    t =>
                        t.wallet == id
                )
                .map(txRow)
                .join('')

            ||

            '<small>Chưa có giao dịch</small>'
        }


        <button
            class="primary full"
            onclick="closeSheet();txList()">

            ＋ Lịch sử giao dịch

        </button>

    `);
}


function editWallet(id) {

    let w =
        wallet(id);


    if(!w)
        return;


    openSheet(`

        <div class="close-row">

            <h3>
                Sửa ví
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="field">

            <label>
                Tên ví
            </label>

            <input
                id="editWName"
                class="input"
                value="${esc(w.name)}">

        </div>


        <div class="field">

            <label>
                Loại ví
            </label>


            <select id="editWSub">

                <option ${w.sub==='Ví tiền mặt'?'selected':''}>
                    Ví tiền mặt
                </option>

                <option ${w.sub==='Ví ngân hàng'?'selected':''}>
                    Ví ngân hàng
                </option>

                <option ${w.sub==='Ví điện tử'?'selected':''}>
                    Ví điện tử
                </option>

                <option ${w.sub==='Thẻ tín dụng'?'selected':''}>
                    Thẻ tín dụng
                </option>

                <option ${
                    ![
                        'Ví tiền mặt',
                        'Ví ngân hàng',
                        'Ví điện tử',
                        'Thẻ tín dụng'
                    ].includes(w.sub)
                    ? 'selected'
                    : ''
                }>
                    ${esc(w.sub)}
                </option>

            </select>

        </div>


        <div class="field">

            <label>
                Biểu tượng
            </label>


            <div class="quick-grid">

                <button
                    class="quick"
                    onclick="setEditWalletIcon('🏦')">

                    🏦

                </button>


                <button
                    class="quick"
                    onclick="setEditWalletIcon('▣')">

                    ▣

                </button>


                <button
                    class="quick"
                    onclick="setEditWalletIcon('▤')">

                    ▤

                </button>


                <button
                    class="quick"
                    onclick="setEditWalletIcon('💳')">

                    💳

                </button>


                <button
                    class="quick"
                    onclick="setEditWalletIcon('💰')">

                    💰

                </button>

            </div>

        </div>


        <input
            id="editWIcon"
            type="hidden"
            value="${esc(w.icon)}">


        <button
            class="primary full"
            style="margin-top:15px"
            onclick="saveWalletEdit(${id})">

            Lưu thay đổi

        </button>

    `);
}


function setEditWalletIcon(icon) {

    document
        .getElementById(
            'editWIcon'
        )
        .value =
        icon;


    toast(
        'Đã chọn biểu tượng'
    );
}


function saveWalletEdit(id) {

    let w =
        wallet(id);


    if(!w)
        return;


    let n =
        document
            .getElementById(
                'editWName'
            )
            .value
            .trim();


    if(!n)
        return toast(
            'Nhập tên ví'
        );


    w.name =
        n;


    w.sub =
        document
            .getElementById(
                'editWSub'
            )
            .value;


    w.icon =
        document
            .getElementById(
                'editWIcon'
            )
            .value
        || w.icon;


    save();

    closeSheet();

    render();

    toast(
        'Đã cập nhật ví'
    );
}


function deleteWallet(id) {

    if(data.wallets.length <= 1)
        return toast(
            'Phải có ít nhất 1 ví'
        );


    if(!confirm(
        'Xóa ví này?'
    ))
        return;


    data.wallets =
        data.wallets.filter(
            w =>
                w.id != id
        );


    save();

    closeSheet();

    render();

    toast(
        'Đã xóa ví'
    );
}


/* =========================
   TRANSACTIONS
========================= */

let selectedWalletForTx =
    null;


function txModal(
    type='expense',
    walletId=null
) {

    selectedWalletForTx =
        walletId;


    openSheet(`

        <div class="close-row">

            <h3>
                Thêm giao dịch
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="seg">

            <button
                id="incomeBtn"
                class="${type==='income'?'active':''}"
                onclick="setTxType('income')">

                🟢 Thu

            </button>


            <button
                id="expenseBtn"
                class="${type==='expense'?'active':''}"
                onclick="setTxType('expense')">

                🔴 Chi

            </button>

        </div>


        <input
            id="txType"
            type="hidden"
            value="${type}">


        <div class="field">

            <label>
                Số tiền
            </label>

            <input
                id="txAmount"
                type="number"
                placeholder="Nhập số tiền">

        </div>


        <div class="field">

            <label>
                Danh mục
            </label>

            <select id="txCat">

                <option>
                    Ăn uống
                </option>

                <option>
                    Đi lại
                </option>

                <option>
                    Học tập
                </option>

                <option>
                    Giải trí
                </option>

                <option>
                    Khác
                </option>

            </select>

        </div>


        <div class="field">

            <label>
                Ví
            </label>

            <select id="txWallet">

                ${
                    data.wallets
                        .map(
                            w =>
                            `<option
                                value="${w.id}"
                                ${
                                    String(
                                        selectedWalletForTx
                                    )
                                    ===
                                    String(w.id)
                                    ? 'selected'
                                    : ''
                                }>

                                ${esc(w.name)}
                                · ${money(w.balance)}

                            </option>`
                        )
                        .join('')
                }

            </select>

        </div>


        <div class="field">

            <label>
                Ngày
            </label>

            <input
                id="txDate"
                value="24/09/2026">

        </div>


        <div class="field">

            <label>
                Ghi chú (tùy chọn)
            </label>

            <textarea
                id="txNote"
                rows="3"
                placeholder="Nhập ghi chú..."></textarea>

        </div>


        <button
            class="primary green full"
            style="margin-top:15px"
            onclick="saveTx()">

            Lưu giao dịch

        </button>

    `);
}


function setTxType(t) {

    document
        .getElementById(
            'txType'
        )
        .value =
        t;


    document
        .getElementById(
            'incomeBtn'
        )
        .classList
        .toggle(
            'active',
            t === 'income'
        );


    document
        .getElementById(
            'expenseBtn'
        )
        .classList
        .toggle(
            'active',
            t === 'expense'
        );
}


function saveTx() {

    let type =
        document
            .getElementById(
                'txType'
            )
            .value;


    let amount =
        +document
            .getElementById(
                'txAmount'
            )
            .value
        || 0;


    let w =
        wallet(
            document
                .getElementById(
                    'txWallet'
                )
                .value
        );


    if(!amount)
        return toast(
            'Nhập số tiền'
        );


    if(
        !w
    )
        return toast(
            'Không tìm thấy ví'
        );


    if(
        type === 'expense' &&
        w.balance < amount
    )
        return toast(
            'Số dư không đủ'
        );


    w.balance +=
        type === 'income'
        ? amount
        : -amount;


    data.transactions.unshift({

        id:
            Date.now(),

        type,

        name:
            document
                .getElementById(
                    'txNote'
                )
                .value
            ||
            document
                .getElementById(
                    'txCat'
                )
                .value,

        cat:
            document
                .getElementById(
                    'txCat'
                )
                .value,

        wallet:
            w.id,

        amount,

        date:
            document
                .getElementById(
                    'txDate'
                )
                .value
            ||
            '24/09/2026',

        time:
            new Date()
                .toLocaleTimeString(
                    'vi-VN',
                    {
                        hour:'2-digit',
                        minute:'2-digit'
                    }
                )

    });


    save();

    closeSheet();

    render();

    toast(
        'Đã lưu giao dịch'
    );
}


function transferModal() {

    openSheet(`

        <div class="close-row">

            <h3>
                Chuyển tiền giữa các ví
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="field">

            <label>
                Từ ví
            </label>

            <select id="fromWallet">

                ${
                    data.wallets
                        .map(
                            w =>
                            `<option value="${w.id}">

                                ${esc(w.name)}
                                · ${money(w.balance)}

                            </option>`
                        )
                        .join('')
                }

            </select>

        </div>


        <div class="field">

            <label>
                Đến ví
            </label>

            <select id="toWallet">

                ${
                    data.wallets
                        .map(
                            w =>
                            `<option value="${w.id}">

                                ${esc(w.name)}
                                · ${money(w.balance)}

                            </option>`
                        )
                        .join('')
                }

            </select>

        </div>


        <div class="field">

            <label>
                Số tiền
            </label>

            <input
                id="transferAmount"
                type="number"
                placeholder="Nhập số tiền">

        </div>


        <div class="field">

            <label>
                Ghi chú
            </label>

            <input
                id="transferNote"
                placeholder="Ví dụ: Chuyển tiền ăn uống">

        </div>


        <button
            class="primary full"
            style="margin-top:15px"
            onclick="doTransfer()">

            Xác nhận

        </button>

    `);
}


function doTransfer() {

    let a =
        +document
            .getElementById(
                'transferAmount'
            )
            .value;


    let from =
        wallet(
            document
                .getElementById(
                    'fromWallet'
                )
                .value
        );


    let to =
        wallet(
            document
                .getElementById(
                    'toWallet'
                )
                .value
        );


    if(
        !from ||
        !to
    )
        return toast(
            'Không tìm thấy ví'
        );


    if(
        from.id === to.id
    )
        return toast(
            'Chọn 2 ví khác nhau'
        );


    if(
        !a ||
        a > from.balance
    )
        return toast(
            'Số tiền không hợp lệ'
        );


    from.balance -=
        a;

    to.balance +=
        a;


    data.transactions.unshift({

        id:
            Date.now(),

        type:
            'transfer',

        name:
            document
                .getElementById(
                    'transferNote'
                )
                .value
            ||
            'Chuyển khoản',

        cat:
            'Chuyển ví',

        wallet:
            from.id,

        amount:
            a,

        date:
            '24/09/2026',

        time:
            new Date()
                .toLocaleTimeString(
                    'vi-VN',
                    {
                        hour:'2-digit',
                        minute:'2-digit'
                    }
                )

    });


    save();

    closeSheet();

    render();

    toast(
        'Đã chuyển tiền'
    );
}


/* =========================
   TRANSACTION LIST
========================= */

function txList() {

    openSheet(`

        <div class="close-row">

            <h3>
                Lịch sử giao dịch
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="tabs">

            <button
                class="active"
                onclick="filterTx('all',this)">

                Tất cả

            </button>


            <button
                onclick="filterTx('income',this)">

                Thu

            </button>


            <button
                onclick="filterTx('expense',this)">

                Chi

            </button>

        </div>


        <div id="txListBody">

            ${data.transactions
                .map(txRow)
                .join('')}

        </div>

    `);
}


function filterTx(type,btn) {

    document
        .querySelectorAll(
            '.sheet .tabs button'
        )
        .forEach(
            b =>
                b.classList.remove(
                    'active'
                )
        );


    btn.classList.add(
        'active'
    );


    let list =
        type === 'all'
        ? data.transactions
        : data.transactions.filter(
            t =>
                t.type === type
        );


    document
        .getElementById(
            'txListBody'
        )
        .innerHTML =

        list
            .map(txRow)
            .join('')

        ||

        '<div class="empty">Không có giao dịch</div>';
}


/* =========================
   STATISTICS
========================= */

function stats() {

    openSheet(`

        <div class="close-row">

            <h3>
                Thống kê chi tiêu
            </h3>

            <button onclick="closeSheet()">
                ×
            </button>

        </div>


        <div class="subtabs">

            <button
                class="${statsTab==='category'?'active':''}"
                onclick="setStatsTab('category')">

                Theo danh mục

            </button>


            <button
                class="${statsTab==='wallet'?'active':''}"
                onclick="setStatsTab('wallet')">

                Theo ví

            </button>

        </div>


        ${
            statsTab==='category'
            ? statsByCategory()
            : statsByWallet()
        }

    `);
}


function setStatsTab(tab) {

    statsTab =
        tab;

    stats();
}


function statsByCategory() {

    return `
    <div class="chart-card">

        <div
            style="
                display:flex;
                justify-content:space-between;
                font-size:10px;
                font-weight:700
            ">

            ‹

            <span>
                Tháng 9/2026
            </span>

            ›

        </div>


        <div class="donut"></div>


        ${
            [
                ['Ăn uống',500000,'40%'],
                ['Đi lại',250000,'20%'],
                ['Học tập',187500,'15%'],
                ['Giải trí',125000,'10%'],
                ['Khác',187500,'15%']
            ]
            .map(
                x =>
                `<div class="legend-row">

                    <i class="legend-dot"></i>

                    <span style="flex:1">
                        ${x[0]}
                    </span>

                    <b>
                        ${money(x[1])}
                    </b>

                    <span>
                        ${x[2]}
                    </span>

                </div>`
            )
            .join('')
        }

    </div>


    <div class="chart-card">

        <h3 style="font-size:11px">
            Top chi tiêu
        </h3>


        ${
            [
                'Ăn uống',
                'Đi lại',
                'Học tập'
            ]
            .map(
                (x,i) =>
                `<div class="legend-row">

                    <span style="flex:1">
                        ${x}
                    </span>

                    <b>
                        ${money(
                            [
                                500000,
                                250000,
                                187500
                            ][i]
                        )}
                    </b>

                </div>`
            )
            .join('')
        }

    </div>`;
}


function statsByWallet() {

    let rows =
        data.wallets
            .map(
                w => {

                    let totalSpent =
                        data.transactions
                            .filter(
                                t =>
                                    t.wallet == w.id &&
                                    t.type === 'expense'
                            )
                            .reduce(
                                (a,t) =>
                                    a+t.amount,
                                0
                            );

                    return [
                        w,
                        totalSpent
                    ];

                }
            )
            .sort(
                (a,b) =>
                    b[1]-a[1]
            );


    return `
    <div class="chart-card">

        <div class="bar-list">

            ${
                rows.map(
                    ([w,n]) =>
                    `<button
                        class="bar-row"
                        onclick="walletDetail(${w.id})">

                        <div class="wallet-icon ${w.cls}">
                            ${w.icon}
                        </div>


                        <div class="grow">

                            <b>
                                ${esc(w.name)}
                            </b>


                            <div class="bar-track">

                                <i
                                    style="
                                        width:${Math.min(
                                            100,
                                            n/5000
                                        )}%
                                    ">
                                </i>

                            </div>

                        </div>


                        <b>
                            ${money(n)}
                        </b>

                    </button>`
                ).join('')
            }

        </div>

    </div>


    <div class="chart-card">

        <h3 style="font-size:11px">
            Chi tiết theo ví
        </h3>


        ${
            rows.map(
                ([w,n]) =>
                `<div class="legend-row">

                    <span style="flex:1">
                        ${esc(w.name)}
                    </span>

                    <b>
                        ${money(n)}
                    </b>

                </div>`
            ).join('')
        }

    </div>`;
}


/* =========================
   SETTINGS
========================= */

function settings() {

    return `
    <div class="screen">

        <div class="top">

            <h1>
                Cài đặt
            </h1>

        </div>


        <div
            class="hello"
            style="
                display:flex;
                align-items:center;
                gap:10px
            ">

            <div class="wallet-icon bank">
                T
            </div>


            <div>

                <b>
                    Triển
                </b>

                <small>
                    Phiên bản 1.0.0
                </small>

            </div>

        </div>


        <div class="section-head">

            <h3>
                Ứng dụng
            </h3>

        </div>


        <div class="settings-row">

            <span>
                ♧
            </span>


            <div class="grow">

                <b>
                    Thông báo
                </b>

            </div>


            <button
                class="switch ${data.settings.notify?'on':''}"
                onclick="toggleSetting('notify')">

                <i></i>

            </button>

        </div>


        <div class="settings-row">

            <span>
                ◐
            </span>


            <div class="grow">

                <b>
                    Giao diện
                </b>

            </div>


            <button onclick="toggleSetting('dark')">

                ${data.settings.dark?'Tối':'Sáng'}　›

            </button>

        </div>


        <div class="settings-row">

            <span>
                ◎
            </span>


            <div class="grow">

                <b>
                    Ngôn ngữ
                </b>

            </div>


            <span
                style="font-size:9px">

                Tiếng Việt ›

            </span>

        </div>


        <div class="section-head">

            <h3>
                Dữ liệu
            </h3>

        </div>


        <div
            class="settings-row"
            onclick="exportData()">

            <span>
                ⇩
            </span>


            <div class="grow">

                <b>
                    Sao lưu & Khôi phục
                </b>

            </div>


            <span>
                ›
            </span>

        </div>


        <div
            class="settings-row"
            onclick="exportData()">

            <span>
                □
            </span>


            <div class="grow">

                <b>
                    Xuất dữ liệu
                </b>

            </div>


            <span>
                ›
            </span>

        </div>


        <div class="settings-row">

            <span>
                ⓘ
            </span>


            <div class="grow">

                <b>
                    Giới thiệu
                </b>

            </div>


            <span>
                ›
            </span>

        </div>


        <button
            class="primary full"
            style="
                margin-top:20px;
                background:#fff0f1;
                color:#e55b64;
                box-shadow:none
            "
            onclick="logoutSupabase()">

            ⎋ Đăng xuất

        </button>

    </div>`;
}


async function toggleSetting(k) {

    if(
        k === 'notify' &&
        !data.settings.notify &&
        'Notification' in window &&
        Notification.permission === 'default'
    ) {

        try {

            await Notification.requestPermission();

        } catch(e) {}

    }


    data.settings[k] =
        !data.settings[k];


    save();

    render();


    toast(

        k === 'dark'

        ? (
            data.settings.dark
            ? 'Đã chuyển sang giao diện tối'
            : 'Đã chuyển sang giao diện sáng'
        )

        : (
            data.settings.notify
            ? 'Đã bật thông báo'
            : 'Đã tắt thông báo'
        )

    );
}


function exportData() {

    let blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:'application/json'
            }
        );


    let a =
        document.createElement(
            'a'
        );


    a.href =
        URL.createObjectURL(
            blob
        );


    a.download =
        'trien-life-backup.json';


    a.click();


    URL.revokeObjectURL(
        a.href
    );


    toast(
        'Đã xuất dữ liệu'
    );
}


/*
   Hàm này giờ chỉ dùng để
   khôi phục dữ liệu mẫu.
   Nó KHÔNG phải đăng xuất.
*/

function resetAll() {

    if(!confirm(
        'Xóa toàn bộ dữ liệu và khôi phục mẫu?'
    ))
        return;


    data =
        structuredClone(
            defaultData
        );


    save();

    render();


    toast(
        'Đã khôi phục dữ liệu mẫu'
    );
}


/* =========================
   MODAL / TOAST
========================= */

function openSheet(html) {

    document
        .getElementById(
            'modalRoot'
        )
        .innerHTML = `

        <div
            class="modal-backdrop"
            onclick="closeSheet()">

            <div
                class="sheet"
                onclick="event.stopPropagation()">

                <div class="grab"></div>

                ${html}

            </div>

        </div>`;
}


function closeSheet() {

    document
        .getElementById(
            'modalRoot'
        )
        .innerHTML = '';
}


function toast(t) {

    let x =
        document.getElementById(
            'toast'
        );


    if(!x)
        return;


    x.textContent =
        t;


    x.classList.add(
        'show'
    );


    clearTimeout(
        window.tt
    );


    window.tt =
        setTimeout(
            () =>
                x.classList.remove(
                    'show'
                ),
            1800
        );
}


function notify(
    title,
    body
) {

    if(
        'Notification' in window &&
        Notification.permission === 'granted'
    ) {

        new Notification(
            title,
            {
                body,
                icon:'./icon-192.png',
                tag:'trien-life'
            }
        );
    }
}


/* =========================
   START APP
========================= */

startReminderChecks();


if(
    'serviceWorker' in navigator
) {

    window.addEventListener(
        'load',
        () =>
            navigator.serviceWorker
                .register('./sw.js')
                .catch(
                    err =>
                        console.error(
                            'Service Worker lỗi:',
                            err
                        )
                )
    );
}


render();

checkSupabase();

getCurrentUser();