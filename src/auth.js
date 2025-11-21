window.Auth={
login(email,password){Storage.load();const u=Storage.users[email];if(!u||u.password!==password)return null;sessionStorage.setItem('nc_current',email);return u;},
signup(email,password){Storage.load();if(Storage.users[email])return null;Storage.users[email]={email,password,admin:false,projects:[]};Storage.save();sessionStorage.setItem('nc_current',email);return Storage.users[email];},
currentUser(){Storage.load();const em=sessionStorage.getItem('nc_current');return em?Storage.users[em]:null;},
logout(){sessionStorage.removeItem('nc_current');}
};
