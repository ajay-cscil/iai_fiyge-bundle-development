<?php
$menu = '';
$menus = array();
if (\kernel\request::authenticate()) {
    $key = 'user-menu.' . (\kernel\request::$mobile === true ? 'm' : 'w') . '.' . \kernel\user::read('role_key');

    $menus = array();
    $cacheMenu = (bool) \kernel\configuration::read('cache_user_menu');
    if ($cacheMenu && \kernel\cache::check('/menus/' . $key)) {
      //  $menus = \kernel\cache::read('/menus/' . $key);
    }
    if (empty($menus)) {
        $modelObj = \module\development_base\model\menus::getInstance(array(), true);

        $menu=[];
        $menuList = $modelObj->find(
                            [
                                'fields' => ['menus.*'],
                                'where' => [
                                    'menus.type' => ['controller','action'],
                                    'menus.is_active' =>1
                                ],
                                'limit' => 0,
                                'order' => ['menus.sequence ASC'],
                                'with_recursive'=>['name'=>'user-menu','parent_id'=>'']
                            ]
                    )
                    ->fetchAll(\PDO::FETCH_ASSOC);
        if (is_array($menuList)) {            
            foreach($menuList as $k => $item){
                $menu[$item['url']]=$item;
            }            
        }
        if(isset($menu['access_controls/users/switch_user'])){
            \kernel\request::sessionWrite('switch_user_mode', true);
            unset($menu['access_controls/users/switch_user']);
        }
        if(isset($menu['projectivity/tasks/time_tracker'])){
            $menus[] = '<a href="' . $this->request->base . 'projectivity/tasks/index?current_listview=62278f42-e218-497c-ad30-4d41ac69033c" data-panel="right" class="time-tracker-control"  ajax=1 ><span class="time-tracker-task"></span>Time Tracker</a>';
            unset($menu['projectivity/tasks/time_tracker']);
        }
        
        if(isset($menu['access_controls/users/_help'])){
            $menus[] = '<a href="' . $this->request->base . 'access_controls/users/_help"  ajax=1 >Help</a>';
        }
        $menus[] = '<a href="' . $this->request->base . 'access_controls/users/view/id:{{USER_ID}}"  ajax=1 >{{NAME}}</a>';
        if (is_array($menu)) {
            foreach ($menu as $k => $item) {
                if(isset($item["is_active"]) && $item["is_active"]){
                    $menus[$k] = '<a href="' . $this->request->base . $item['url'] . '/id:{{USER_ID}}" ajax="' . $item['ajax'] . '" >' . __($item['name']) . '</a>';
                }
            }
        }
        $menus[] = '<a href="' . $this->request->base . 'access_controls/users/logout"  >' . __('Logout') . '</a>';

       

        

        

        $menus = implode('&nbsp;|&nbsp;', $menus);
        if ($cacheMenu) {
            //\kernel\cache::write('/menus/' . $key, $menus);
        }
    }
    $menus = \kernel\form::processMerge($menus, array('USER_ID' => \kernel\user::read('id'), 'NAME' => ucwords(\kernel\user::read('name'))));
}

$userListOptions=[];
if(\kernel\request::session('switch_user_mode')){
        $userObj = \module\access_controls\model\users::getInstance();
        $userList=select(["users.name","users.user_name","users.id","organizations.name as 'organization'",])
        ->from($userObj)
        ->join('organizations')
        ->where('users.is_active',1)
        ->order(["users.name ASC"])
        ->execute()
        ->fetchAll(\PDO::FETCH_ASSOC);
        $userListOptions=[];
        foreach($userList as $userLi){
            if(!isset($userListOptions[$userLi["organization"]])){
                $userListOptions[$userLi["organization"]]=[];
            }
            $userListOptions[$userLi["organization"]][]=["value"=>$userLi["id"],"text"=>"{$userLi["name"]} [{$userLi["user_name"]}]"];
        }    
}
?>
<div id="user_menu">
    <a href="#" class="open-notification-sidebar"  >
            <img class="notification-bell" src="/img/icons/notification-bell.png">
            <span class="notification-count"></span>
    </a>
    
    <?php if(\kernel\request::session('switch_user_mode')){ ?>
    <select id="switch_user" style="max-width:300px">
    <?php echo \kernel\html::options($userListOptions,\kernel\user::read('id'),false); ?>
    </select>
    <?php } ?>
    <?php echo is_string($menus)?$menus:''; ?> 
</div>
<script type="text/javascript">
    jQuery(document).ready(function(){
        jQuery('#switch_user').change(function(){
            document.location.href="/access_controls/users/switch_user/id:"+jQuery(this).val();
        });
    });
    
</script>
<div class="sidebars">
            <div class="sidebar sidebar-right">
                <div class="sidebar-header ui-widget-header">
                    Notifications
                    <a class="close-notification-sidebar ui-state-error" type="button">
                        <span class="ui-icon ui-icon-close"></span>
                    </a>
                </div>
                <div class="notification-list" data-pagenumber="0"></div>
                <div class="notification-action-bar">
                    
                    <button class="load-notifications btn btn-success" type="button">Load More</button>
                    <button class="mark-as-read-notifications btn btn-secondary" type="button">Mark as read</button>
                    <button class="mark-as-delete-notifications btn btn-secondary" type="button">Delete</button>
                </div>
            </div>
</div>
