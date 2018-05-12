"use strict";

var ContextMenu = function(options_list) {
    this.target = options_list.target;
    
    let menu = document.createElement("nav");
    menu.classList.add("context-menu");
    
    //class names for shorter usage
    this.target.append(menu);
    let activeClass = "context-menu--active";
    let overflowClass = "context-menu--overflow";
    let containerClass = "context-menu__items";
    let oneItemClass = "context-menu__item";
    let childTitleClass = "context-menu__item-title";
    let submenuClass = "context-menu__sublevel";
    let hasSublevelClass = "context-menu__items--hasSublevel";
    let menuItemHiddenClass = "context-menu__item--hidden";
    let disabledClass = "context-menu__item--disabled";
    let scrollClass = "context-menu__scroll";
    let scrollTopClass = "context-menu__scroll-top";
    let scrollBottomClass = "context-menu__scroll-bottom";
    let scrollHiddenClass = "context-menu__scroll--hidden";
    
    (() => {
        let items = renderMenu(options_list.menuItems);
        menu.append(items);
    })();  //init render
    
    function renderMenu(menuItems,level = 0) {
        let current_level = level || 0;
        let container = document.createElement("ul");
        
        container.classList.add(containerClass);
        if (current_level > 0) container.classList.add("context-menu__sublevel");
        menuItems.forEach((item,i,arr) => {
            let item_container = document.createElement('li');
            item_container.classList.add(oneItemClass);
            let title = document.createElement('span');
            title.classList.add(childTitleClass);
            title.innerHTML = item.title;
            item_container.appendChild(title);
            if (item.disabled) item_container.classList.add(disabledClass);
            let submenu;
            if (item.submenu.length) {
                item_container.classList.add(hasSublevelClass);
                submenu = renderMenu(item.submenu, current_level+1);
                item_container.appendChild(submenu);
                
                title.addEventListener("mouseover", (e) => {
                    setPosition(submenu,getPosSubmenu(e),true);
                    e.preventDefault();
                }); 
            }
            container.appendChild(item_container);
            item_container.addEventListener("click",item.clickHandler);
        });
        return container;
    } 

    this.showMenu = (pos) => {
        menu.classList.add(activeClass);
        setPosition(menu, pos);
    }
    
    this.hideMenu = () => {
        menu.classList.remove(activeClass);
    }
    
    //for main container
    function getPosition(e) {
      let posx = 0;
      let posy = 0;

      if (!e) e = window.event;

      if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
      } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + 
                           document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + 
                           document.documentElement.scrollTop;
      }
        
      return {
        x: posx,
        y: posy
      }
    }
    
    //for submenus
    function getPosSubmenu(e) {
        let target = e.target;
        if (!target.classList.contains(oneItemClass)) target = target.parentNode;

        let submenu = target.querySelector("."+submenuClass);
        let posX = target.getClientRects()[0].width - 2;
        let posY = 5;
        
        let width = parseInt(window.getComputedStyle(submenu,null).getPropertyValue("width"));
        let height = parseInt(window.getComputedStyle(submenu,null).getPropertyValue("height"));
        
        let clientHeight = document.documentElement.clientHeight - 19;
        let clientWidth = document.documentElement.clientWidth - 19;
        
        let menuItem =  document.querySelector(".context-menu__item");
        let menuItemHeight = parseInt(window.getComputedStyle(menuItem,null).getPropertyValue("height"));
        
        let parentRightPos = target.getClientRects()[0].right;
        let parentTopPos = target.getClientRects()[0].top;

        if ((parentRightPos + posX) > clientWidth) {
            posX = 0 - posX;
        }
        
        if ((parentTopPos + posY + height) > clientHeight) posY = menuItemHeight - height - 5;
        
        return {
            x: posX,
            y: posY
        }
    }
    
    function setPosition(target, pos, relative = false) {
        let width = parseInt(window.getComputedStyle(target,null).getPropertyValue("width"));
        let height = parseInt(window.getComputedStyle(target,null).getPropertyValue("height"));
        let clientHeight = document.documentElement.clientHeight - 19;
        let clientWidth = document.documentElement.clientWidth - 19;
        let destX = pos.x;
        let destY = pos.y;
        
        let parent = target.parentNode;
        
        let parentTopPos = parent.getClientRects()[0].top;

        if ((pos.x + width) > clientWidth) destX = pos.x - width;
        
        if (relative) {
            pos.y = pos.y + parentTopPos;
        }
        
        if (height > clientHeight) {
            cutMenu(target,clientHeight);
            height = parseInt(window.getComputedStyle(target,null).getPropertyValue("height"));
            destY = Math.floor((clientHeight - height)/2);
            target.classList.add(overflowClass);
        }
        else {
            
            if ((pos.y + height) > clientHeight) {
                if ((pos.y - height) < 0) {
                    destY = Math.floor((clientHeight - height)/2);
                } else {
                    destY = pos.y - height;
                }
            } else {
                destY = pos.y;
                if (destY < 0) {
                    destY = 0;
                }
            }
        }
        
        if (relative) {
            destX = pos.x;
            destY = destY - parentTopPos;
        }
        
        target.style.left = destX + "px";
        target.style.top = destY + "px";
    }
    
    function cutMenu(target, clientHeight) {
        if (!target.classList.contains(containerClass))  target = target.querySelector("."+containerClass);
        let scrollTop = document.createElement("span");
        let scrollBottom = document.createElement("span");
        scrollTop.classList.add(scrollTopClass,scrollClass,scrollHiddenClass);
        scrollBottom.classList.add(scrollBottomClass,scrollClass);
        target.insertBefore(scrollTop,target.firstChild);
        target.append(scrollBottom);
        target.setAttribute("data-scrollPos",0);
        let scrollButton = document.querySelector("."+scrollClass);
        let scrollButtonHeight = parseInt(window.getComputedStyle(scrollButton,null).getPropertyValue("height"));
        let aviableHeight = clientHeight - 2*scrollButtonHeight;
        let menuItem =  document.querySelector(".context-menu__item");
        let menuItemHeight = parseInt(window.getComputedStyle(menuItem,null).getPropertyValue("height"));
        let maxItemsCount = Math.floor(aviableHeight/menuItemHeight);
        target.setAttribute("data-itemsCount",maxItemsCount);
       
        let targetChildren = target.children;
        let totalItemsCount = targetChildren.length - 2;
        
       for (let i = 1; i<totalItemsCount - 1; i++) {
           if (i>= maxItemsCount-1) {
                targetChildren[i].classList.add("context-menu__item--hidden");
            }
       }

        
        
        scrollTop.addEventListener("click", (e) => {
            
            scrollMenu(target,-1);
      
        });
        scrollBottom.addEventListener("click", (e) => {
            scrollMenu(target,1);
  
        });
        
        
    }
    
    function scrollMenu(target, scrollValue) {

        let targetChildren = target.children;
        let totalItemsCount = targetChildren.length - 2;
        let currentScrollPos = parseInt(target.getAttribute("data-scrollPos"));
        let visibleItemsCount = parseInt(target.getAttribute("data-itemsCount"));
        
        let newScrollPos = currentScrollPos + scrollValue;
        
        if (newScrollPos < 0) newScrollPos = 0;
        if (newScrollPos > (totalItemsCount - visibleItemsCount)) newScrollPos = totalItemsCount - visibleItemsCount;
        
        
        if (newScrollPos == 0) {
            target.querySelector("."+scrollTopClass).classList.add(scrollHiddenClass);
        }
        else {
             target.querySelector("."+scrollTopClass).classList.remove(scrollHiddenClass);
        }
        if (newScrollPos == (totalItemsCount - visibleItemsCount)) {
             target.querySelector("."+scrollBottomClass).classList.add(scrollHiddenClass);
        }
        else {
            target.querySelector("."+scrollBottomClass).classList.remove(scrollHiddenClass);
        }

        
        target.setAttribute("data-scrollPos",newScrollPos);
        
        for (let i=1; i<targetChildren.length-1; i++) {
            targetChildren[i].classList.add(menuItemHiddenClass);
            if (((i-1) >= newScrollPos) && ((i-1) <= (newScrollPos + visibleItemsCount - 1))) {
                targetChildren[i].classList.remove(menuItemHiddenClass);
            }
        }
        
        
    }
    
    document.addEventListener("contextmenu",(e) => {
        if (e.target == this.target || e.target.parentElement == this.target) {
            e.preventDefault();
            let pos = getPosition(e);
            this.showMenu(pos);
        }
        else {
            this.hideMenu();
        }

    });
    
    document.addEventListener("click", (e) => {
        let target = e.target;
        let button = e.which || e.button;
        if ( button === 1 && !target.classList.contains("context-menu__scroll")) {
           this.hideMenu();
        }
    });
}

var elem = document.body;

var options = {
    "target": elem,
    "menuItems": [
        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": true,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": true,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": true,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": false
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": true,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },
        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": false
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": true,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": false
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": [
                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu level_2 item 1",
                                    "disabled": false,
                                    "submenu": false
                },
                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": false
                }
        ]
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": [
                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": false
                }
        ]
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": false
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },
                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": false
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": false
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": [
                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu level_2 item 1",
                                                            "disabled": false,
                                                            "submenu": false
                },
                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": false
                }
        ]
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": false
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": false
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": false
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": false
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": false
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": false
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": [
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu level_2 item 1",
                                                    "disabled": false,
                                                    "submenu": false
                },
                                                {
                                                    "clickHandler": defClickHandler,
                                                    "title": "menu item 2",
                                                    "disabled": false,
                                                    "submenu": [
                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": false
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },
                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": false
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": false
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },
                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": false
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": false
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },
                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": [
                                                                                {
                                                                                    "clickHandler": defClickHandler,
                                                                                    "title": "menu level_2 item 1",
                                                                                    "disabled": false,
                                                                                    "submenu": false
                },
                                                                                {
                                                                                    "clickHandler": defClickHandler,
                                                                                    "title": "menu item 2",
                                                                                    "disabled": false,
                                                                                    "submenu": false
                }
        ]
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": [
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu level_2 item 1",
                                                                            "disabled": false,
                                                                            "submenu": false
                },
                                                                        {
                                                                            "clickHandler": defClickHandler,
                                                                            "title": "menu item 2",
                                                                            "disabled": false,
                                                                            "submenu": false
                }
        ]
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        },

                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
        }
    ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": false
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 2",
                                                            "disabled": false,
                                                            "submenu": [
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu level_2 item 1",
                                                                    "disabled": false,
                                                                    "submenu": false
                },
                                                                {
                                                                    "clickHandler": defClickHandler,
                                                                    "title": "menu item 2",
                                                                    "disabled": false,
                                                                    "submenu": false
                }
        ]
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        },

                                                        {
                                                            "clickHandler": defClickHandler,
                                                            "title": "menu item 1",
                                                            "disabled": false,
                                                            "submenu": false
        }
    ]
                }
        ]
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        },

                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 1",
                                            "disabled": false,
                                            "submenu": false
        }
    ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },
                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": false
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": false
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },
                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": false
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 2",
                                    "disabled": false,
                                    "submenu": [
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu level_2 item 1",
                                            "disabled": false,
                                            "submenu": false
                },
                                        {
                                            "clickHandler": defClickHandler,
                                            "title": "menu item 2",
                                            "disabled": false,
                                            "submenu": false
                }
        ]
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        },

                                {
                                    "clickHandler": defClickHandler,
                                    "title": "menu item 1",
                                    "disabled": false,
                                    "submenu": false
        }
    ]
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": [
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu level_2 item 1",
                            "disabled": false,
                            "submenu": false
                },
                        {
                            "clickHandler": defClickHandler,
                            "title": "menu item 2",
                            "disabled": false,
                            "submenu": false
                }
        ]
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        },

                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 1",
                    "disabled": false,
                    "submenu": false
        }
    ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },
        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": false
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": false
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },
        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": false
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [
                {
                    "clickHandler": defClickHandler,
                    "title": "menu level_2 item 1",
                    "disabled": false,
                    "submenu": false
                },
                {
                    "clickHandler": defClickHandler,
                    "title": "menu item 2",
                    "disabled": false,
                    "submenu": false
                }
        ]
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        },

        {
            "clickHandler": defClickHandler,
            "title": "menu item 1",
            "disabled": false,
            "submenu": false
        }
    ]
}

var ctx = new ContextMenu(options);

function defClickHandler() {
    console.log("default click handler");
}







