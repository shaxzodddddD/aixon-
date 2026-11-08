let coins=1250, balance=24.50;
const navItems=["Home","Explore","Short Video","Messages","Notifications","Communities","Marketplace","Freelance","Academy","Events","Creator Studio","AI Agent","Kanallar","Coin","Referal","Vazifalar","Mening Dokonim","Balans","Jonli Efir","Oyinlar","Reklama","AI Fabrika","Dostlarni Topish"];
document.getElementById('nav').innerHTML=navItems.map((n,i)=>'<button class="'+(i==0?'active':'')+'" onclick="go(this)">'+n+'</button>').join('');
function go(b){document.querySelectorAll('nav button').forEach(x=>x.classList.remove('active'));b.classList.add('active');}
const stories=[["+","Create Story"],["S","Your Story"],["Tech"],["Fitness"],["Travel"],["Fashion"],["AI"],["Business"],["Gaming"],["Music"]];
document.getElementById('stories').innerHTML=stories.map(s=>'<div class="story" onclick="addStory()"><div class="c">'+s[0]+'</div><small>'+s[1]+'</small></div>').join('');
let posts=[]; fetch('/api/posts').then(r=>r.json()).then(d=>{posts=d;render();});
function render(){document.getElementById('feed').innerHTML=posts.map(p=>'<div class="post"><b>'+p.author+'</b> <span style="opacity:.6">'+p.user+' - '+p.time+'</span><p>'+p.text+'</p><p style="color:#a78bfa">'+(p.tag||'')+'</p><div class="row"><button onclick="like(this)">Like '+p.likes+'</button><button>Comment '+p.comments+'</button><button onclick="sharePost()">Share +5 Coin</button></div></div>').join('');}
function like(b){coins+=2;update();let n=parseInt(b.textContent.replace(/\D/g,''))||0;b.textContent='Like '+(n+1);}
function sharePost(){coins+=5;update();alert('Ulashildi! +5 Coin');}
function update(){document.getElementById('coins').textContent=coins;document.getElementById('balance').textContent='$'+balance.toFixed(2);}
function addPost(){let t=document.getElementById('postText').value;if(!t)return alert('Matn yozing!');posts.unshift({author:"Shaxzod Xakimov",user:"@shaxzodx1",text:t,likes:0,comments:0,time:"now",tag:"#AXIOM"});document.getElementById('postText').value='';coins+=5;update();render();}
function addVideo(){let u=prompt('Video URL (YouTube yoki MP4):');if(!u)return;posts.unshift({author:"Shaxzod Xakimov",user:"@shaxzodx1",text:'Yangi video: '+u,likes:0,comments:0,time:"now",tag:"#Video"});render();alert('Video post qoshildi!');}
function addStory(){let t=prompt('Storiya matni:');if(!t)return;alert('Storiya qoshildi: '+t+' (24 soat)');coins+=5;update();}
function createChannel(){let n=prompt('Kanal nomi:');if(!n)return;alert('Kanal ochildi: '+n);}
function invite(){coins+=200;update();alert('Referal link nusxalandi: axiomworld.com/?ref=AXIOM-SHAXZOD +200 Coin (2X)!');}
function spin(){let p=[10,50,100,500,0][Math.floor(Math.random()*5)];coins+=p;update();document.getElementById('spinResult').textContent=p?('Tabriklaymiz! +'+p+' Coin!'):'Bu safar chiqmadi, ertaga yana urining!';}
function askAI(){let q=document.getElementById('aiInput').value;if(!q)return;document.getElementById('aiText').textContent='AI: "'+q+'" boyicha 3 ta goya tayyorladim: 1) Post yoz, 2) Dostlarni taklif qil, 3) Gildirakni aylantir.';document.getElementById('aiInput').value='';}
function openPremium(){showModal('<h2>AXIOM Premium</h2><p>Plus $49 - Verified badge</p><p>Pro $99 - 500 credits</p><p>Elite $149 - Unlimited AI</p><p>Elite Pro $299 - VIP</p><button class="primary" onclick="payPlan()">Pro $99 - Tolash</button>');}
function payPlan(){showModal('<h3>Tolov - Pro $99</h3><p>CEO kartasi: 8600 **** **** 1234<br>Bank: Kapitalbank</p><input placeholder="Ismingiz"><input placeholder="Karta oxirgi 4 raqami"><input placeholder="Chek ID"><button class="primary" onclick="alert(\'Chek yuborildi! Admin tasdiqlaydi\');closeModal()">Chekni yuborish</button>');}
function showAuth(){showModal('<h2>AXIOM ga xush kelibsiz</h2><input placeholder="Ism"><input placeholder="Username"><input placeholder="Email"><input placeholder="Telefon +998"><input type="password" placeholder="Parol"><input placeholder="Referal kod"><button class="primary" onclick="alert(\'Royxatdan otildi! +100 Coin\');closeModal()">Royxatdan otish</button>');}
function showModal(h){document.getElementById('modalContent').innerHTML=h;document.getElementById('modal').classList.remove('hidden');}
function closeModal(){document.getElementById('modal').classList.add('hidden');}
let clicks=0; document.querySelector('.logo').addEventListener('click',()=>{clicks++; if(clicks>=5){let e=prompt('CEO Email:');let p=prompt('CEO Parol:'); if(e==='ceo@axiom.uz'&&p==='ceo2026')alert('CEO Dashboard!'); else alert('Xato!'); clicks=0;}});
