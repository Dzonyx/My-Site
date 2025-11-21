window.Storage={
key:'nc_users_v3',
users:{'nocodebuilder@hotmail.com':{email:'nocodebuilder@hotmail.com',password:'Nikolapro1!',admin:true,projects:[]}},
load(){try{const raw=localStorage.getItem(this.key);if(raw){const data=JSON.parse(raw);if(data.users)this.users=data.users;}}catch(e){console.error(e);}},
save(){try{localStorage.setItem(this.key,JSON.stringify({users:this.users}));}catch(e){console.error(e);}},
findPublished(urlId){this.load();for(const em in this.users){const u=this.users[em];for(const p of(u.projects||[])){if(p.published && p.published.urlId===urlId)return p;}}return null;}
};
Storage.load();
