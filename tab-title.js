(function(){'use strict';var BASE_TITLE='MiLatido 👫❤️';var STORAGE_KEY='crf4_lastVisitTs';var _badgeCount=0;var _blinkTimer=null;var _isBlinking=false;function getLastVisit(){try{var v=localStorage.getItem(STORAGE_KEY);return v?parseInt(v,10):0;}
catch(e){return 0;}}
function saveLastVisit(){try{localStorage.setItem(STORAGE_KEY,Date.now().toString());}catch(e){}}
function setTitle(n){if(n>0){document.title='('+(n>99?'99+':n)+') '+BASE_TITLE;}else{document.title=BASE_TITLE;}}
function startBlink(){if(_isBlinking||_badgeCount===0)return;_isBlinking=true;var alt=false;_blinkTimer=setInterval(function(){document.title=alt?'🎣 ¡'+_badgeCount+' novedades! — '+BASE_TITLE:'('+_badgeCount+') '+BASE_TITLE;alt=!alt;},1400);}
function stopBlink(){_isBlinking=false;if(_blinkTimer){clearInterval(_blinkTimer);_blinkTimer=null;}
setTitle(_badgeCount);}
document.addEventListener('visibilitychange',function(){if(document.hidden){if(_badgeCount>0)startBlink();}else{stopBlink();}});function countNewPosts(posts,lastTs){if(!lastTs)return 0;return posts.filter(function(p){var t=p.time||(p.createdAt&&p.createdAt.toMillis?p.createdAt.toMillis():0);return t>lastTs;}).length;}
function hookRenderFeed(){var origRender=window.renderFeed;if(typeof origRender!=='function'){setTimeout(hookRenderFeed,800);return;}
var lastVisitTs=getLastVisit();saveLastVisit();window.renderFeed=function(){origRender.apply(this,arguments);var posts=window._posts||[];_badgeCount=countNewPosts(posts,lastVisitTs);setTitle(_badgeCount);if(document.hidden&&_badgeCount>0)startBlink();};}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',hookRenderFeed);}else{hookRenderFeed();}
window.addEventListener('pagehide',saveLastVisit);window.addEventListener('beforeunload',saveLastVisit);window._rf4Badge={getCount:function(){return _badgeCount;},reset:function(){_badgeCount=0;setTitle(0);},setLastVisit:function(ts){try{localStorage.setItem(STORAGE_KEY,ts.toString());}catch(e){}}};})();