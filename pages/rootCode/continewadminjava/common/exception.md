# common/config/exception
  ## GlobalExceptionHandler.java——全局异常处理
```java
@Slf4j
@Order(99)
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 拦截业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public R handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()), e.getMessage());
    }

    /**
     * 拦截自定义验证异常-错误请求
     */
    @ExceptionHandler(BadRequestException.class)
    public R handleBadRequestException(BadRequestException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), e.getMessage());
    }

    /**
     * 拦截文件上传异常-超过上传大小限制
     */
    @ExceptionHandler(MultipartException.class)
    public R handleRequestTooBigException(MultipartException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        String msg = e.getMessage();
        R defaultFail = R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), msg);
        if (CharSequenceUtil.isBlank(msg)) {
            return defaultFail;
        }
        String sizeLimit;
        Throwable cause = e.getCause();
        if (null != cause) {
            msg = msg.concat(cause.getMessage().toLowerCase());
        }
        if (msg.contains("size") && msg.contains("exceed")) {
            sizeLimit = CharSequenceUtil.subBetween(msg, "the maximum size ", " for");
        } else if (msg.contains("larger than")) {
            sizeLimit = CharSequenceUtil.subAfter(msg, "larger than ", true);
        } else {
            return defaultFail;
        }
        String errorMsg = "请上传小于 %sKB 的文件".formatted(NumberUtil.parseLong(sizeLimit) / 1024);
        return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), errorMsg);
    }
}
```

##### 分析：
```java
@Slf4j
@Order(99)
@RestControllerAdvice
public class GlobalExceptionHandler {
```

+ `@Slf4j` 注解自动生成日志记录的代码。
+ `@Order(99)` 用于定义此异常处理器的优先级。
+ `@RestControllerAdvice` 是一个组合注解，用于定义一个全局的异常处理器。
1. **异常处理方法**：
    - **业务异常处理**：

```java
@ExceptionHandler(BusinessException.class)
public R handleBusinessException(BusinessException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    return R.fail(String.valueOf(HttpStatus.INTERNAL_SERVER_ERROR.value()), e.getMessage());
}
```
* 捕捉 `BusinessException`，记录错误信息，并返回包含错误信息的响应。
  
    - **错误请求处理**：
    
```java
@ExceptionHandler(BadRequestException.class)
public R handleBadRequestException(BadRequestException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), e.getMessage());
}
```

* 捕捉 `BadRequestException`，记录错误信息，并返回400错误响应。
    - **文件上传大小限制处理**：

```java
@ExceptionHandler(MultipartException.class)
public R handleRequestTooBigException(MultipartException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    String msg = e.getMessage();
    R defaultFail = R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), msg);
    ...
    return R.fail(String.valueOf(HttpStatus.BAD_REQUEST.value()), errorMsg);
}
```

* 捕捉 `MultipartException`，即文件上传时超过大小限制。通过分析异常信息构建友好的提示信息，然后返回400错误响应，提示用户“请上传小于XXKB的文件”。

## GlobalSaTokenExceptionHandler.java——satoken全局异常处理
```java
/**
 * 全局 SaToken 异常处理器
 */
@Slf4j
@Order(99)
@RestControllerAdvice
public class GlobalSaTokenExceptionHandler {

    /**
     * 认证异常-登录认证
     */
    @ExceptionHandler(NotLoginException.class)
    public R handleNotLoginException(NotLoginException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        String errorMsg = switch (e.getType()) {
            case NotLoginException.KICK_OUT -> "您已被踢下线";
            case NotLoginException.BE_REPLACED_MESSAGE -> "您已被顶下线";
            default -> "您的登录状态已过期，请重新登录";
        };
        return R.fail(String.valueOf(HttpStatus.UNAUTHORIZED.value()), errorMsg);
    }

    /**
     * 认证异常-权限认证
     */
    @ExceptionHandler(NotPermissionException.class)
    public R handleNotPermissionException(NotPermissionException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.FORBIDDEN.value()), "没有访问权限，请联系管理员授权");
    }

    /**
     * 认证异常-角色认证
     */
    @ExceptionHandler(NotRoleException.class)
    public R handleNotRoleException(NotRoleException e, HttpServletRequest request) {
        log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
        return R.fail(String.valueOf(HttpStatus.FORBIDDEN.value()), "没有访问权限，请联系管理员授权");
    }
}
```

##### 分析：
1. **注解**:

```java
@Slf4j
@Order(99)
@RestControllerAdvice
```
- `@Slf4j`用于日志记录。
- `@Order(99)`定义了异常处理器的优先级，值越小优先级越高。
- `@RestControllerAdvice`是一个组合注解，表示该类是一个控制器增强（Advice），可以用来捕获和处理控制器抛出的异常。
2. **日志和异常处理方法**:
- 每个方法均使用`@ExceptionHandler`注解来处理特定类型的异常。
- 例如，对`NotLoginException`的处理方法如下：

```java
@ExceptionHandler(NotLoginException.class)
public R handleNotLoginException(NotLoginException e, HttpServletRequest request) {
    log.error("[{}] {}", request.getMethod(), request.getRequestURI(), e);
    ...
}
```

- `handleNotLoginException`方法会在捕获到`NotLoginException`时被调用。
3. **异常处理逻辑**:
    - 在`handleNotLoginException`方法中，
        * 使用`log.error`记录请求的方法（如GET、POST）和请求路径（URI）以及异常信息。
        * 通过`switch`语句判断异常类型，设置相应的错误信息。
        * 最后返回一个包装好的失败响应，包含HTTP状态码和错误信息。
    - 其他两个处理方法`handleNotPermissionException`和`handleNotRoleException`的处理逻辑类似，但它们返回的错误信息一致，均提示没有访问权限。

#### switch示例
```java
int day = 3; // 假设1表示星期一，2表示星期二，依此类推

String dayName; // 用于存储星期几的名称

switch (day) {
    case 1:
        dayName = "星期一";
        break;
    case 2:
        dayName = "星期二";
        break;
    case 3:
        dayName = "星期三";
        break;
    case 4:
        dayName = "星期四";
        break;
    case 5:
        dayName = "星期五";
        break;
    case 6:
        dayName = "星期六";
        break;
    case 7:
        dayName = "星期日";
        break;
    default:
        dayName = "无效的输入"; // 处理不在1到7范围内的输入
        break;
}

System.out.println("今天是: " + dayName);



今天是: 星期三

```
