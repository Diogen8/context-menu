"use strict";

var ContextMenu = function ContextMenu(options_list) {
    var _this = this;

    this.target = options_list.target;

    var menu = document.createElement("nav");
    menu.classList.add("context-menu");

    //class names for shorter usage
    this.target.appendChild(menu);
    var activeClass = "context-menu--active";
    var overflowClass = "context-menu--overflow";
    var containerClass = "context-menu__items";
    var oneItemClass = "context-menu__item";
    var childTitleClass = "context-menu__item-title";
    var submenuClass = "context-menu__sublevel";
    var hasSublevelClass = "context-menu__items--hasSublevel";
    var menuItemHiddenClass = "context-menu__item--hidden";
    var disabledClass = "context-menu__item--disabled";
    var scrollClass = "context-menu__scroll";
    var scrollTopClass = "context-menu__scroll-top";
    var scrollBottomClass = "context-menu__scroll-bottom";
    var scrollHiddenClass = "context-menu__scroll--hidden";

    (function () {
        var items = renderMenu(options_list.menuItems);
        menu.appendChild(items);
    })(); //init render

    function renderMenu(menuItems) {
        var level = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var current_level = level || 0;
        var container = document.createElement("ul");

        container.classList.add(containerClass);
        if (current_level > 0) container.classList.add("context-menu__sublevel");
        menuItems.forEach(function (item, i, arr) {
            var item_container = document.createElement('li');
            item_container.classList.add(oneItemClass);
            var title = document.createElement('span');
            title.classList.add(childTitleClass);
            title.innerHTML = item.title;
            item_container.appendChild(title);
            if (item.disabled) item_container.classList.add(disabledClass);
            var submenu = void 0;
            if (item.submenu.length) {
                item_container.classList.add(hasSublevelClass);
                submenu = renderMenu(item.submenu, current_level + 1);
                item_container.appendChild(submenu);

                title.addEventListener("mouseover", function (e) {
                    setPosition(submenu, getPosSubmenu(e), true);
                    e.preventDefault();
                });
            }
            container.appendChild(item_container);
            item_container.addEventListener("click", item.clickHandler);
        });
        return container;
    }

    this.showMenu = function (pos) {
        menu.classList.add(activeClass);
        setPosition(menu, pos);
    };

    this.hideMenu = function () {
        menu.classList.remove(activeClass);
    };

    //for main container
    function getPosition(e) {
        var posx = 0;
        var posy = 0;

        if (!e) e = window.event;

        if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
        } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return {
            x: posx,
            y: posy
        };
    }

    //for submenus
    function getPosSubmenu(e) {
        var target = e.target;
        if (!target.classList.contains(oneItemClass)) target = target.parentNode;

        var submenu = target.querySelector("." + submenuClass);
        var posX = target.getClientRects()[0].width - 2;
        var posY = 5;

        var width = parseInt(window.getComputedStyle(submenu, null).getPropertyValue("width"));
        var height = parseInt(window.getComputedStyle(submenu, null).getPropertyValue("height"));

        var clientHeight = document.documentElement.clientHeight - 19;
        var clientWidth = document.documentElement.clientWidth - 19;

        var menuItem = document.querySelector(".context-menu__item");
        var menuItemHeight = parseInt(window.getComputedStyle(menuItem, null).getPropertyValue("height"));

        var parentRightPos = target.getClientRects()[0].right;
        var parentTopPos = target.getClientRects()[0].top;

        if (parentRightPos + posX > clientWidth) {
            posX = 0 - posX;
        }

        if (parentTopPos + posY + height > clientHeight) posY = menuItemHeight - height - 5;

        return {
            x: posX,
            y: posY
        };
    }

    function setPosition(target, pos) {
        var relative = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

        var width = parseInt(window.getComputedStyle(target, null).getPropertyValue("width"));
        var height = parseInt(window.getComputedStyle(target, null).getPropertyValue("height"));
        var clientHeight = document.documentElement.clientHeight - 19;
        var clientWidth = document.documentElement.clientWidth - 19;
        var destX = pos.x;
        var destY = pos.y;

        var parent = target.parentNode;

        var parentTopPos = parent.getClientRects()[0].top;

        if (pos.x + width > clientWidth) destX = pos.x - width;

        if (relative) {
            pos.y = pos.y + parentTopPos;
        }

        if (height > clientHeight) {
            cutMenu(target, clientHeight);
            height = parseInt(window.getComputedStyle(target, null).getPropertyValue("height"));
            destY = Math.floor((clientHeight - height) / 2);
            target.classList.add(overflowClass);
        } else {

            if (pos.y + height > clientHeight) {
                if (pos.y - height < 0) {
                    destY = Math.floor((clientHeight - height) / 2);
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
        if (!target.classList.contains(containerClass)) target = target.querySelector("." + containerClass);
        var scrollTop = document.createElement("span");
        var scrollBottom = document.createElement("span");
        scrollTop.classList.add(scrollTopClass, scrollClass, scrollHiddenClass);
        scrollBottom.classList.add(scrollBottomClass, scrollClass);
        target.insertBefore(scrollTop, target.firstChild);
        target.appendChild(scrollBottom);
        target.setAttribute("data-scrollPos", 0);
        var scrollButton = document.querySelector("." + scrollClass);
        var scrollButtonHeight = parseInt(window.getComputedStyle(scrollButton, null).getPropertyValue("height"));
        var aviableHeight = clientHeight - 2 * scrollButtonHeight;
        var menuItem = document.querySelector(".context-menu__item");
        var menuItemHeight = parseInt(window.getComputedStyle(menuItem, null).getPropertyValue("height"));
        var maxItemsCount = Math.floor(aviableHeight / menuItemHeight);
        target.setAttribute("data-itemsCount", maxItemsCount);

        var targetChildren = target.children;
        var totalItemsCount = targetChildren.length - 2;

        for (var i = 1; i < totalItemsCount - 1; i++) {
            if (i >= maxItemsCount - 1) {
                targetChildren[i].classList.add("context-menu__item--hidden");
            }
        }

        scrollTop.addEventListener("click", function (e) {

            scrollMenu(target, -1);
        });
        scrollBottom.addEventListener("click", function (e) {
            scrollMenu(target, 1);
        });
    }

    function scrollMenu(target, scrollValue) {

        var targetChildren = target.children;
        var totalItemsCount = targetChildren.length - 2;
        var currentScrollPos = parseInt(target.getAttribute("data-scrollPos"));
        var visibleItemsCount = parseInt(target.getAttribute("data-itemsCount"));

        var newScrollPos = currentScrollPos + scrollValue;

        if (newScrollPos < 0) newScrollPos = 0;
        if (newScrollPos > totalItemsCount - visibleItemsCount) newScrollPos = totalItemsCount - visibleItemsCount;

        if (newScrollPos == 0) {
            target.firstChild.classList.add(scrollHiddenClass);
        } else {
            target.firstChild.classList.remove(scrollHiddenClass);
        }
        if (newScrollPos == totalItemsCount - visibleItemsCount) {
            target.lastChild.classList.add(scrollHiddenClass);
        } else {
            target.lastChild.classList.remove(scrollHiddenClass);
        }

        target.setAttribute("data-scrollPos", newScrollPos);

        for (var i = 1; i < targetChildren.length - 1; i++) {
            targetChildren[i].classList.add(menuItemHiddenClass);
            if (i - 1 >= newScrollPos && i - 1 <= newScrollPos + visibleItemsCount - 1) {
                targetChildren[i].classList.remove(menuItemHiddenClass);
            }
        }
    }

    function bindEvent(el, eventName, eventHandler) {
        if (el.addEventListener) {
            el.addEventListener(eventName, eventHandler, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + eventName, eventHandler);
        }
    }

    bindEvent(document, "contextmenu", function (e) {
        if (e.target == _this.target || e.target.parentElement == _this.target) {
            e.preventDefault();
            var pos = getPosition(e);
            _this.showMenu(pos);
        } else {
            _this.hideMenu();
        }
    });

    bindEvent(document, "click", function (e) {
        var target = e.target;
        var button = e.which || e.button;
        if (button === 1 && !target.classList.contains("context-menu__scroll")) {
            _this.hideMenu();
        }
    });
};

var elem = document.getElementById("target");

var options = {
    "target": elem,
    "menuItems": [{
        "clickHandler": defClickHandler,
        "title": "menu item 1",
        "disabled": true,
        "submenu": false
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }, {
        "clickHandler": defClickHandler,
        "title": "menu item 2",
        "disabled": false,
        "submenu": [{
            "clickHandler": defClickHandler,
            "title": "menu level_2 item 1",
            "disabled": false,
            "submenu": false
        }, {
            "clickHandler": defClickHandler,
            "title": "menu item 2",
            "disabled": false,
            "submenu": [{
                "clickHandler": defClickHandler,
                "title": "menu level_2 item 1",
                "disabled": false,
                "submenu": false
            }, {
                "clickHandler": defClickHandler,
                "title": "menu item 2",
                "disabled": false,
                "submenu": false
            }]
        }]
    }]
};

var ctx = new ContextMenu(options);

function defClickHandler() {
    console.log("default click handler");
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuXG52YXIgQ29udGV4dE1lbnUgPSBmdW5jdGlvbiBDb250ZXh0TWVudShvcHRpb25zX2xpc3QpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy50YXJnZXQgPSBvcHRpb25zX2xpc3QudGFyZ2V0O1xuXG4gICAgdmFyIG1lbnUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibmF2XCIpO1xuICAgIG1lbnUuY2xhc3NMaXN0LmFkZChcImNvbnRleHQtbWVudVwiKTtcblxuICAgIC8vY2xhc3MgbmFtZXMgZm9yIHNob3J0ZXIgdXNhZ2VcbiAgICB0aGlzLnRhcmdldC5hcHBlbmRDaGlsZChtZW51KTtcbiAgICB2YXIgYWN0aXZlQ2xhc3MgPSBcImNvbnRleHQtbWVudS0tYWN0aXZlXCI7XG4gICAgdmFyIG92ZXJmbG93Q2xhc3MgPSBcImNvbnRleHQtbWVudS0tb3ZlcmZsb3dcIjtcbiAgICB2YXIgY29udGFpbmVyQ2xhc3MgPSBcImNvbnRleHQtbWVudV9faXRlbXNcIjtcbiAgICB2YXIgb25lSXRlbUNsYXNzID0gXCJjb250ZXh0LW1lbnVfX2l0ZW1cIjtcbiAgICB2YXIgY2hpbGRUaXRsZUNsYXNzID0gXCJjb250ZXh0LW1lbnVfX2l0ZW0tdGl0bGVcIjtcbiAgICB2YXIgc3VibWVudUNsYXNzID0gXCJjb250ZXh0LW1lbnVfX3N1YmxldmVsXCI7XG4gICAgdmFyIGhhc1N1YmxldmVsQ2xhc3MgPSBcImNvbnRleHQtbWVudV9faXRlbXMtLWhhc1N1YmxldmVsXCI7XG4gICAgdmFyIG1lbnVJdGVtSGlkZGVuQ2xhc3MgPSBcImNvbnRleHQtbWVudV9faXRlbS0taGlkZGVuXCI7XG4gICAgdmFyIGRpc2FibGVkQ2xhc3MgPSBcImNvbnRleHQtbWVudV9faXRlbS0tZGlzYWJsZWRcIjtcbiAgICB2YXIgc2Nyb2xsQ2xhc3MgPSBcImNvbnRleHQtbWVudV9fc2Nyb2xsXCI7XG4gICAgdmFyIHNjcm9sbFRvcENsYXNzID0gXCJjb250ZXh0LW1lbnVfX3Njcm9sbC10b3BcIjtcbiAgICB2YXIgc2Nyb2xsQm90dG9tQ2xhc3MgPSBcImNvbnRleHQtbWVudV9fc2Nyb2xsLWJvdHRvbVwiO1xuICAgIHZhciBzY3JvbGxIaWRkZW5DbGFzcyA9IFwiY29udGV4dC1tZW51X19zY3JvbGwtLWhpZGRlblwiO1xuXG4gICAgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGl0ZW1zID0gcmVuZGVyTWVudShvcHRpb25zX2xpc3QubWVudUl0ZW1zKTtcbiAgICAgICAgbWVudS5hcHBlbmRDaGlsZChpdGVtcyk7XG4gICAgfSkoKTsgLy9pbml0IHJlbmRlclxuXG4gICAgZnVuY3Rpb24gcmVuZGVyTWVudShtZW51SXRlbXMpIHtcbiAgICAgICAgdmFyIGxldmVsID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMV0gOiAwO1xuXG4gICAgICAgIHZhciBjdXJyZW50X2xldmVsID0gbGV2ZWwgfHwgMDtcbiAgICAgICAgdmFyIGNvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ1bFwiKTtcblxuICAgICAgICBjb250YWluZXIuY2xhc3NMaXN0LmFkZChjb250YWluZXJDbGFzcyk7XG4gICAgICAgIGlmIChjdXJyZW50X2xldmVsID4gMCkgY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoXCJjb250ZXh0LW1lbnVfX3N1YmxldmVsXCIpO1xuICAgICAgICBtZW51SXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSwgaSwgYXJyKSB7XG4gICAgICAgICAgICB2YXIgaXRlbV9jb250YWluZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICAgICAgaXRlbV9jb250YWluZXIuY2xhc3NMaXN0LmFkZChvbmVJdGVtQ2xhc3MpO1xuICAgICAgICAgICAgdmFyIHRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICAgICAgdGl0bGUuY2xhc3NMaXN0LmFkZChjaGlsZFRpdGxlQ2xhc3MpO1xuICAgICAgICAgICAgdGl0bGUuaW5uZXJIVE1MID0gaXRlbS50aXRsZTtcbiAgICAgICAgICAgIGl0ZW1fY29udGFpbmVyLmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICAgICAgICAgIGlmIChpdGVtLmRpc2FibGVkKSBpdGVtX2NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKGRpc2FibGVkQ2xhc3MpO1xuICAgICAgICAgICAgdmFyIHN1Ym1lbnUgPSB2b2lkIDA7XG4gICAgICAgICAgICBpZiAoaXRlbS5zdWJtZW51Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGl0ZW1fY29udGFpbmVyLmNsYXNzTGlzdC5hZGQoaGFzU3VibGV2ZWxDbGFzcyk7XG4gICAgICAgICAgICAgICAgc3VibWVudSA9IHJlbmRlck1lbnUoaXRlbS5zdWJtZW51LCBjdXJyZW50X2xldmVsICsgMSk7XG4gICAgICAgICAgICAgICAgaXRlbV9jb250YWluZXIuYXBwZW5kQ2hpbGQoc3VibWVudSk7XG5cbiAgICAgICAgICAgICAgICB0aXRsZS5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNldFBvc2l0aW9uKHN1Ym1lbnUsIGdldFBvc1N1Ym1lbnUoZSksIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoaXRlbV9jb250YWluZXIpO1xuICAgICAgICAgICAgaXRlbV9jb250YWluZXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGl0ZW0uY2xpY2tIYW5kbGVyKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjb250YWluZXI7XG4gICAgfVxuXG4gICAgdGhpcy5zaG93TWVudSA9IGZ1bmN0aW9uIChwb3MpIHtcbiAgICAgICAgbWVudS5jbGFzc0xpc3QuYWRkKGFjdGl2ZUNsYXNzKTtcbiAgICAgICAgc2V0UG9zaXRpb24obWVudSwgcG9zKTtcbiAgICB9O1xuXG4gICAgdGhpcy5oaWRlTWVudSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbWVudS5jbGFzc0xpc3QucmVtb3ZlKGFjdGl2ZUNsYXNzKTtcbiAgICB9O1xuXG4gICAgLy9mb3IgbWFpbiBjb250YWluZXJcbiAgICBmdW5jdGlvbiBnZXRQb3NpdGlvbihlKSB7XG4gICAgICAgIHZhciBwb3N4ID0gMDtcbiAgICAgICAgdmFyIHBvc3kgPSAwO1xuXG4gICAgICAgIGlmICghZSkgZSA9IHdpbmRvdy5ldmVudDtcblxuICAgICAgICBpZiAoZS5wYWdlWCB8fCBlLnBhZ2VZKSB7XG4gICAgICAgICAgICBwb3N4ID0gZS5wYWdlWDtcbiAgICAgICAgICAgIHBvc3kgPSBlLnBhZ2VZO1xuICAgICAgICB9IGVsc2UgaWYgKGUuY2xpZW50WCB8fCBlLmNsaWVudFkpIHtcbiAgICAgICAgICAgIHBvc3ggPSBlLmNsaWVudFggKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQgKyBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsTGVmdDtcbiAgICAgICAgICAgIHBvc3kgPSBlLmNsaWVudFkgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCArIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3A7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcG9zeCxcbiAgICAgICAgICAgIHk6IHBvc3lcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvL2ZvciBzdWJtZW51c1xuICAgIGZ1bmN0aW9uIGdldFBvc1N1Ym1lbnUoZSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIGlmICghdGFyZ2V0LmNsYXNzTGlzdC5jb250YWlucyhvbmVJdGVtQ2xhc3MpKSB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcblxuICAgICAgICB2YXIgc3VibWVudSA9IHRhcmdldC5xdWVyeVNlbGVjdG9yKFwiLlwiICsgc3VibWVudUNsYXNzKTtcbiAgICAgICAgdmFyIHBvc1ggPSB0YXJnZXQuZ2V0Q2xpZW50UmVjdHMoKVswXS53aWR0aCAtIDI7XG4gICAgICAgIHZhciBwb3NZID0gNTtcblxuICAgICAgICB2YXIgd2lkdGggPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdWJtZW51LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwid2lkdGhcIikpO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUoc3VibWVudSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShcImhlaWdodFwiKSk7XG5cbiAgICAgICAgdmFyIGNsaWVudEhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSAxOTtcbiAgICAgICAgdmFyIGNsaWVudFdpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gMTk7XG5cbiAgICAgICAgdmFyIG1lbnVJdGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZXh0LW1lbnVfX2l0ZW1cIik7XG4gICAgICAgIHZhciBtZW51SXRlbUhlaWdodCA9IHBhcnNlSW50KHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG1lbnVJdGVtLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwiaGVpZ2h0XCIpKTtcblxuICAgICAgICB2YXIgcGFyZW50UmlnaHRQb3MgPSB0YXJnZXQuZ2V0Q2xpZW50UmVjdHMoKVswXS5yaWdodDtcbiAgICAgICAgdmFyIHBhcmVudFRvcFBvcyA9IHRhcmdldC5nZXRDbGllbnRSZWN0cygpWzBdLnRvcDtcblxuICAgICAgICBpZiAocGFyZW50UmlnaHRQb3MgKyBwb3NYID4gY2xpZW50V2lkdGgpIHtcbiAgICAgICAgICAgIHBvc1ggPSAwIC0gcG9zWDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwYXJlbnRUb3BQb3MgKyBwb3NZICsgaGVpZ2h0ID4gY2xpZW50SGVpZ2h0KSBwb3NZID0gbWVudUl0ZW1IZWlnaHQgLSBoZWlnaHQgLSA1O1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwb3NYLFxuICAgICAgICAgICAgeTogcG9zWVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNldFBvc2l0aW9uKHRhcmdldCwgcG9zKSB7XG4gICAgICAgIHZhciByZWxhdGl2ZSA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG5cbiAgICAgICAgdmFyIHdpZHRoID0gcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwid2lkdGhcIikpO1xuICAgICAgICB2YXIgaGVpZ2h0ID0gcGFyc2VJbnQod2luZG93LmdldENvbXB1dGVkU3R5bGUodGFyZ2V0LCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKFwiaGVpZ2h0XCIpKTtcbiAgICAgICAgdmFyIGNsaWVudEhlaWdodCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSAxOTtcbiAgICAgICAgdmFyIGNsaWVudFdpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gMTk7XG4gICAgICAgIHZhciBkZXN0WCA9IHBvcy54O1xuICAgICAgICB2YXIgZGVzdFkgPSBwb3MueTtcblxuICAgICAgICB2YXIgcGFyZW50ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG5cbiAgICAgICAgdmFyIHBhcmVudFRvcFBvcyA9IHBhcmVudC5nZXRDbGllbnRSZWN0cygpWzBdLnRvcDtcblxuICAgICAgICBpZiAocG9zLnggKyB3aWR0aCA+IGNsaWVudFdpZHRoKSBkZXN0WCA9IHBvcy54IC0gd2lkdGg7XG5cbiAgICAgICAgaWYgKHJlbGF0aXZlKSB7XG4gICAgICAgICAgICBwb3MueSA9IHBvcy55ICsgcGFyZW50VG9wUG9zO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGhlaWdodCA+IGNsaWVudEhlaWdodCkge1xuICAgICAgICAgICAgY3V0TWVudSh0YXJnZXQsIGNsaWVudEhlaWdodCk7XG4gICAgICAgICAgICBoZWlnaHQgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSh0YXJnZXQsIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJoZWlnaHRcIikpO1xuICAgICAgICAgICAgZGVzdFkgPSBNYXRoLmZsb29yKChjbGllbnRIZWlnaHQgLSBoZWlnaHQpIC8gMik7XG4gICAgICAgICAgICB0YXJnZXQuY2xhc3NMaXN0LmFkZChvdmVyZmxvd0NsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgaWYgKHBvcy55ICsgaGVpZ2h0ID4gY2xpZW50SGVpZ2h0KSB7XG4gICAgICAgICAgICAgICAgaWYgKHBvcy55IC0gaGVpZ2h0IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBkZXN0WSA9IE1hdGguZmxvb3IoKGNsaWVudEhlaWdodCAtIGhlaWdodCkgLyAyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkZXN0WSA9IHBvcy55IC0gaGVpZ2h0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzdFkgPSBwb3MueTtcbiAgICAgICAgICAgICAgICBpZiAoZGVzdFkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlc3RZID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocmVsYXRpdmUpIHtcbiAgICAgICAgICAgIGRlc3RYID0gcG9zLng7XG4gICAgICAgICAgICBkZXN0WSA9IGRlc3RZIC0gcGFyZW50VG9wUG9zO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0LnN0eWxlLmxlZnQgPSBkZXN0WCArIFwicHhcIjtcbiAgICAgICAgdGFyZ2V0LnN0eWxlLnRvcCA9IGRlc3RZICsgXCJweFwiO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGN1dE1lbnUodGFyZ2V0LCBjbGllbnRIZWlnaHQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKGNvbnRhaW5lckNsYXNzKSkgdGFyZ2V0ID0gdGFyZ2V0LnF1ZXJ5U2VsZWN0b3IoXCIuXCIgKyBjb250YWluZXJDbGFzcyk7XG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKTtcbiAgICAgICAgdmFyIHNjcm9sbEJvdHRvbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO1xuICAgICAgICBzY3JvbGxUb3AuY2xhc3NMaXN0LmFkZChzY3JvbGxUb3BDbGFzcywgc2Nyb2xsQ2xhc3MsIHNjcm9sbEhpZGRlbkNsYXNzKTtcbiAgICAgICAgc2Nyb2xsQm90dG9tLmNsYXNzTGlzdC5hZGQoc2Nyb2xsQm90dG9tQ2xhc3MsIHNjcm9sbENsYXNzKTtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShzY3JvbGxUb3AsIHRhcmdldC5maXJzdENoaWxkKTtcbiAgICAgICAgdGFyZ2V0LmFwcGVuZENoaWxkKHNjcm9sbEJvdHRvbSk7XG4gICAgICAgIHRhcmdldC5zZXRBdHRyaWJ1dGUoXCJkYXRhLXNjcm9sbFBvc1wiLCAwKTtcbiAgICAgICAgdmFyIHNjcm9sbEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuXCIgKyBzY3JvbGxDbGFzcyk7XG4gICAgICAgIHZhciBzY3JvbGxCdXR0b25IZWlnaHQgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzY3JvbGxCdXR0b24sIG51bGwpLmdldFByb3BlcnR5VmFsdWUoXCJoZWlnaHRcIikpO1xuICAgICAgICB2YXIgYXZpYWJsZUhlaWdodCA9IGNsaWVudEhlaWdodCAtIDIgKiBzY3JvbGxCdXR0b25IZWlnaHQ7XG4gICAgICAgIHZhciBtZW51SXRlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGV4dC1tZW51X19pdGVtXCIpO1xuICAgICAgICB2YXIgbWVudUl0ZW1IZWlnaHQgPSBwYXJzZUludCh3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShtZW51SXRlbSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShcImhlaWdodFwiKSk7XG4gICAgICAgIHZhciBtYXhJdGVtc0NvdW50ID0gTWF0aC5mbG9vcihhdmlhYmxlSGVpZ2h0IC8gbWVudUl0ZW1IZWlnaHQpO1xuICAgICAgICB0YXJnZXQuc2V0QXR0cmlidXRlKFwiZGF0YS1pdGVtc0NvdW50XCIsIG1heEl0ZW1zQ291bnQpO1xuXG4gICAgICAgIHZhciB0YXJnZXRDaGlsZHJlbiA9IHRhcmdldC5jaGlsZHJlbjtcbiAgICAgICAgdmFyIHRvdGFsSXRlbXNDb3VudCA9IHRhcmdldENoaWxkcmVuLmxlbmd0aCAtIDI7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0b3RhbEl0ZW1zQ291bnQgLSAxOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChpID49IG1heEl0ZW1zQ291bnQgLSAxKSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Q2hpbGRyZW5baV0uY2xhc3NMaXN0LmFkZChcImNvbnRleHQtbWVudV9faXRlbS0taGlkZGVuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc2Nyb2xsVG9wLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuXG4gICAgICAgICAgICBzY3JvbGxNZW51KHRhcmdldCwgLTEpO1xuICAgICAgICB9KTtcbiAgICAgICAgc2Nyb2xsQm90dG9tLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgc2Nyb2xsTWVudSh0YXJnZXQsIDEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzY3JvbGxNZW51KHRhcmdldCwgc2Nyb2xsVmFsdWUpIHtcblxuICAgICAgICB2YXIgdGFyZ2V0Q2hpbGRyZW4gPSB0YXJnZXQuY2hpbGRyZW47XG4gICAgICAgIHZhciB0b3RhbEl0ZW1zQ291bnQgPSB0YXJnZXRDaGlsZHJlbi5sZW5ndGggLSAyO1xuICAgICAgICB2YXIgY3VycmVudFNjcm9sbFBvcyA9IHBhcnNlSW50KHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNjcm9sbFBvc1wiKSk7XG4gICAgICAgIHZhciB2aXNpYmxlSXRlbXNDb3VudCA9IHBhcnNlSW50KHRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWl0ZW1zQ291bnRcIikpO1xuXG4gICAgICAgIHZhciBuZXdTY3JvbGxQb3MgPSBjdXJyZW50U2Nyb2xsUG9zICsgc2Nyb2xsVmFsdWU7XG5cbiAgICAgICAgaWYgKG5ld1Njcm9sbFBvcyA8IDApIG5ld1Njcm9sbFBvcyA9IDA7XG4gICAgICAgIGlmIChuZXdTY3JvbGxQb3MgPiB0b3RhbEl0ZW1zQ291bnQgLSB2aXNpYmxlSXRlbXNDb3VudCkgbmV3U2Nyb2xsUG9zID0gdG90YWxJdGVtc0NvdW50IC0gdmlzaWJsZUl0ZW1zQ291bnQ7XG5cbiAgICAgICAgaWYgKG5ld1Njcm9sbFBvcyA9PSAwKSB7XG4gICAgICAgICAgICB0YXJnZXQuZmlyc3RDaGlsZC5jbGFzc0xpc3QuYWRkKHNjcm9sbEhpZGRlbkNsYXNzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRhcmdldC5maXJzdENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoc2Nyb2xsSGlkZGVuQ2xhc3MpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdTY3JvbGxQb3MgPT0gdG90YWxJdGVtc0NvdW50IC0gdmlzaWJsZUl0ZW1zQ291bnQpIHtcbiAgICAgICAgICAgIHRhcmdldC5sYXN0Q2hpbGQuY2xhc3NMaXN0LmFkZChzY3JvbGxIaWRkZW5DbGFzcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQubGFzdENoaWxkLmNsYXNzTGlzdC5yZW1vdmUoc2Nyb2xsSGlkZGVuQ2xhc3MpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0LnNldEF0dHJpYnV0ZShcImRhdGEtc2Nyb2xsUG9zXCIsIG5ld1Njcm9sbFBvcyk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCB0YXJnZXRDaGlsZHJlbi5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgICAgIHRhcmdldENoaWxkcmVuW2ldLmNsYXNzTGlzdC5hZGQobWVudUl0ZW1IaWRkZW5DbGFzcyk7XG4gICAgICAgICAgICBpZiAoaSAtIDEgPj0gbmV3U2Nyb2xsUG9zICYmIGkgLSAxIDw9IG5ld1Njcm9sbFBvcyArIHZpc2libGVJdGVtc0NvdW50IC0gMSkge1xuICAgICAgICAgICAgICAgIHRhcmdldENoaWxkcmVuW2ldLmNsYXNzTGlzdC5yZW1vdmUobWVudUl0ZW1IaWRkZW5DbGFzcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBiaW5kRXZlbnQoZWwsIGV2ZW50TmFtZSwgZXZlbnRIYW5kbGVyKSB7XG4gICAgICAgIGlmIChlbC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgZXZlbnRIYW5kbGVyLCBmYWxzZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZWwuYXR0YWNoRXZlbnQpIHtcbiAgICAgICAgICAgIGVsLmF0dGFjaEV2ZW50KCdvbicgKyBldmVudE5hbWUsIGV2ZW50SGFuZGxlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBiaW5kRXZlbnQoZG9jdW1lbnQsIFwiY29udGV4dG1lbnVcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0ID09IF90aGlzLnRhcmdldCB8fCBlLnRhcmdldC5wYXJlbnRFbGVtZW50ID09IF90aGlzLnRhcmdldCkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyIHBvcyA9IGdldFBvc2l0aW9uKGUpO1xuICAgICAgICAgICAgX3RoaXMuc2hvd01lbnUocG9zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF90aGlzLmhpZGVNZW51KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGJpbmRFdmVudChkb2N1bWVudCwgXCJjbGlja1wiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgIHZhciBidXR0b24gPSBlLndoaWNoIHx8IGUuYnV0dG9uO1xuICAgICAgICBpZiAoYnV0dG9uID09PSAxICYmICF0YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKFwiY29udGV4dC1tZW51X19zY3JvbGxcIikpIHtcbiAgICAgICAgICAgIF90aGlzLmhpZGVNZW51KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbnZhciBlbGVtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXJnZXRcIik7XG5cbnZhciBvcHRpb25zID0ge1xuICAgIFwidGFyZ2V0XCI6IGVsZW0sXG4gICAgXCJtZW51SXRlbXNcIjogW3tcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDFcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiB0cnVlLFxuICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfSwge1xuICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGl0ZW0gMlwiLFxuICAgICAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICAgICAgXCJzdWJtZW51XCI6IGZhbHNlXG4gICAgICAgICAgICB9XVxuICAgICAgICB9XVxuICAgIH0sIHtcbiAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBsZXZlbF8yIGl0ZW0gMVwiLFxuICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICB9LCB7XG4gICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogW3tcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgICAgICAgICBcInRpdGxlXCI6IFwibWVudSBpdGVtIDJcIixcbiAgICAgICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgICAgIFwic3VibWVudVwiOiBmYWxzZVxuICAgICAgICAgICAgfV1cbiAgICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAgIFwiY2xpY2tIYW5kbGVyXCI6IGRlZkNsaWNrSGFuZGxlcixcbiAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgIFwic3VibWVudVwiOiBbe1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgbGV2ZWxfMiBpdGVtIDFcIixcbiAgICAgICAgICAgIFwiZGlzYWJsZWRcIjogZmFsc2UsXG4gICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICBcImRpc2FibGVkXCI6IGZhbHNlLFxuICAgICAgICAgICAgXCJzdWJtZW51XCI6IFt7XG4gICAgICAgICAgICAgICAgXCJjbGlja0hhbmRsZXJcIjogZGVmQ2xpY2tIYW5kbGVyLFxuICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJtZW51IGxldmVsXzIgaXRlbSAxXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICBcImNsaWNrSGFuZGxlclwiOiBkZWZDbGlja0hhbmRsZXIsXG4gICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIm1lbnUgaXRlbSAyXCIsXG4gICAgICAgICAgICAgICAgXCJkaXNhYmxlZFwiOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBcInN1Ym1lbnVcIjogZmFsc2VcbiAgICAgICAgICAgIH1dXG4gICAgICAgIH1dXG4gICAgfV1cbn07XG5cbnZhciBjdHggPSBuZXcgQ29udGV4dE1lbnUob3B0aW9ucyk7XG5cbmZ1bmN0aW9uIGRlZkNsaWNrSGFuZGxlcigpIHtcbiAgICBjb25zb2xlLmxvZyhcImRlZmF1bHQgY2xpY2sgaGFuZGxlclwiKTtcbn0iXSwiZmlsZSI6Im1haW4uanMifQ==
