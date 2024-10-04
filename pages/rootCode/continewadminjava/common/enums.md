# common/enums
## DataScopeEnum.java——数据权限枚举
```java
@Getter
@RequiredArgsConstructor
public enum DataScopeEnum implements BaseEnum<Integer> {

    /**
     * 全部数据权限
     */
    ALL(1, "全部数据权限"),

    /**
     * 本部门及以下数据权限
     */
    DEPT_AND_CHILD(2, "本部门及以下数据权限"),

    /**
     * 本部门数据权限
     */
    DEPT(3, "本部门数据权限"),

    /**
     * 仅本人数据权限
     */
    SELF(4, "仅本人数据权限"),

    /**
     * 自定义数据权限
     */
    CUSTOM(5, "自定义数据权限"),;

    private final Integer value;
    private final String description;
}
```

## DisEnableStatusEnum.java——启动禁用状态枚举
```java
public enum DisEnableStatusEnum implements BaseEnum<Integer> {

    /**
     * 启用
     */
    ENABLE(1, "启用", UiConstants.COLOR_SUCCESS),

    /**
     * 禁用
     */
    DISABLE(2, "禁用", UiConstants.COLOR_ERROR),;

    private final Integer value;
    private final String description;
    private final String color;
}
```