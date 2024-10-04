# common/constant
## CacheConstants.java——缓存相关常量
```java
public class CacheConstants {

    /**
     * 分隔符
     */
    public static final String DELIMITER = StringConstants.COLON;

    /**
     * 登录用户键
     */
    public static final String LOGIN_USER_KEY = "LOGIN_USER";

    /**
     * 验证码键前缀
     */
    public static final String CAPTCHA_KEY_PREFIX = "CAPTCHA" + DELIMITER;

    /**
     * 用户缓存键前缀
     */
    public static final String USER_KEY_PREFIX = "USER" + DELIMITER;

    /**
     * 菜单缓存键前缀
     */
    public static final String MENU_KEY_PREFIX = "MENU" + DELIMITER;

    /**
     * 字典缓存键前缀
     */
    public static final String DICT_KEY_PREFIX = "DICT" + DELIMITER;

    /**
     * 参数缓存键前缀
     */
    public static final String OPTION_KEY_PREFIX = "OPTION" + DELIMITER;

    /**
     * 仪表盘缓存键前缀
     */
    public static final String DASHBOARD_KEY_PREFIX = "DASHBOARD" + DELIMITER;

    /**
     * 用户密码错误次数缓存键前缀
     */
    public static final String USER_PASSWORD_ERROR_KEY_PREFIX = USER_KEY_PREFIX + "PASSWORD_ERROR" + DELIMITER;

    /**
     * 数据导入临时会话key
     */
    public static final String DATA_IMPORT_KEY = "SYSTEM" + DELIMITER + "DATA_IMPORT" + DELIMITER;

    private CacheConstants() {
    }
}
```

## ContainerConstants.java——数据源容器相关常量（Crane4j 数据填充组件使用）
```java
public class ContainerConstants extends ContainerPool {

    /**
     * 用户昵称
     */
    public static final String USER_NICKNAME = ContainerPool.USER_NICKNAME;

    /**
     * 用户角色 ID 列表
     */
    public static final String USER_ROLE_ID_LIST = "UserRoleIdList";

    /**
     * 用户角色名称列表
     */
    public static final String USER_ROLE_NAME_LIST = "UserRoleNameList";

    private ContainerConstants() {
    }
}
```

```java
public class ContainerPool {
    public static final String USER_NICKNAME = "UserNickname";

    protected ContainerPool() {
    }
}
```

## RegexConstants.java——正则相关常量
```java
public class RegexConstants {

    /**
     * 用户名正则（用户名长度为 4-64 个字符，支持大小写字母、数字、下划线，以字母开头）
     */
    public static final String USERNAME = "^[a-zA-Z][a-zA-Z0-9_]{3,64}$";

    /**
     * 密码正则模板（密码长度为 min-max 个字符，支持大小写字母、数字、特殊字符，至少包含字母和数字）
     */
    public static final String PASSWORD_TEMPLATE = "^(?=.*\\d)(?=.*[a-z]).{%s,%s}$";

    /**
     * 密码正则（密码长度为 8-32 个字符，支持大小写字母、数字、特殊字符，至少包含字母和数字）
     */
    public static final String PASSWORD = "^(?=.*\\d)(?=.*[a-z]).{8,32}$";

    /**
     * 特殊字符正则
     */
    public static final String SPECIAL_CHARACTER = "[-_`~!@#$%^&*()+=|{}':;',\\\\[\\\\].<>/?~！@#￥%……&*（）——+|{}【】‘；：”“’。，、？]|\\n|\\r|\\t";

    /**
     * 通用编码正则（长度为 2-30 个字符，支持大小写字母、数字、下划线，以字母开头）
     */
    public static final String GENERAL_CODE = "^[a-zA-Z][a-zA-Z0-9_]{1,29}$";

    /**
     * 通用名称正则（长度为 2-30 个字符，支持中文、字母、数字、下划线，短横线）
     */
    public static final String GENERAL_NAME = "^[\\u4e00-\\u9fa5a-zA-Z0-9_-]{2,30}$";

    /**
     * 包名正则（可以包含大小写字母、数字、下划线，每一级包名不能以数字开头）
     */
    public static final String PACKAGE_NAME = "^(?:[a-zA-Z_][a-zA-Z0-9_]*\\.)*[a-zA-Z_][a-zA-Z0-9_]*$";

    private RegexConstants() {
    }
}
```

## SysConstants.java——系统相关常量

```java
public class SysConstants {

    /**
     * 否
     */
    public static final Integer NO = 0;

    /**
     * 是
     */
    public static final Integer YES = 1;

    /**
     * 管理员角色编码
     */
    public static final String ADMIN_ROLE_CODE = "admin";

    /**
     * 顶级部门 ID
     */
    public static final Long SUPER_DEPT_ID = 1L;

    /**
     * 顶级父 ID
     */
    public static final Long SUPER_PARENT_ID = 0L;

    /**
     * 全部权限标识
     */
    public static final String ALL_PERMISSION = "*:*:*";

    /**
     * 账号登录 URI
     */
    public static final String LOGIN_URI = "/auth/account";

    /**
     * 退出 URI
     */
    public static final String LOGOUT_URI = "/auth/logout";

    /**
     * 描述类字段后缀
     */
    public static final String DESCRIPTION_FIELD_SUFFIX = "String";

    private SysConstants() {
    }//这是一个私有构造函数，防止外部实例化该类。因为这个类只包含静态常量，没有必要创建对象
}
```

## UiConstants.java——ui相关常量
```java
public class UiConstants {

    /**
     * 主色（极致蓝）
     */
    public static final String COLOR_PRIMARY = "arcoblue";

    /**
     * 成功色（仙野绿）
     */
    public static final String COLOR_SUCCESS = "green";

    /**
     * 警告色（活力橙）
     */
    public static final String COLOR_WARNING = "orangered";

    /**
     * 错误色（浪漫红）
     */
    public static final String COLOR_ERROR = "red";

    /**
     * 默认色（中性灰）
     */
    public static final String COLOR_DEFAULT = "gray";

    private UiConstants() {
    }
}
```