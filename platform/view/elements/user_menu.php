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

        $menu = $modelObj->find(
                            array(
                                'fields' => array('menus.*'),
                                'where' => array(
                                    'menus.type' => 'controller',
                                    'menus.is_active' => 1,
                                ),
                                'limit' => 0,
                                'order' => array('menus.sequence ASC'),
                                'with_recursive'=>['name'=>'user-menu','parent_id'=>'']
                            )
                    )
                    ->fetchAll(\PDO::FETCH_ASSOC);

        
        $menus[] = '<a href="' . $this->request->base . 'access_controls/users/_help"  ajax=1 >Help</a>';
        $menus[] = '<a href="' . $this->request->base . 'access_controls/users/view/id:{{USER_ID}}"  ajax=1 >{{NAME}}</a>';
        if (is_array($menu)) {
            foreach ($menu as $k => $item) {
                $menus[$k] = '<a href="' . $this->request->base . $item['url'] . '/id:{{USER_ID}}" ajax="' . $item['ajax'] . '" >' . __($item['name']) . '</a>';
            }
        }
        $menus[] = '<a href="' . $this->request->base . 'access_controls/users/logout"  >' . __('Logout') . '</a>';
        $menus = implode('&nbsp;|&nbsp;', $menus);
        if ($cacheMenu) {
            \kernel\cache::write('/menus/' . $key, $menus);
        }
    }
    $menus = \kernel\form::processMerge($menus, array('USER_ID' => \kernel\user::read('id'), 'NAME' => ucwords(\kernel\user::read('name'))));
}
?>
<div id="user_menu"><?php echo is_string($menus)?:''; ?> </div>

