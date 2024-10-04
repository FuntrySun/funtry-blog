# controller/common
## CaptchaController.java——验证码Api
```java
@Tag(name = "验证码 API")
@SaIgnore
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/captcha")
public class CaptchaController {

    private final ProjectProperties projectProperties;
    private final CaptchaProperties captchaProperties;
    private final CaptchaService behaviorCaptchaService;
    private final GraphicCaptchaService graphicCaptchaService;
    private final OptionService optionService;

    @Log(ignore = true)
    @Operation(summary = "获取行为验证码", description = "获取行为验证码（Base64编码）")
    @GetMapping("/behavior")
    public Object getBehaviorCaptcha(CaptchaVO captchaReq, HttpServletRequest request) {
        captchaReq.setBrowserInfo(JakartaServletUtil.getClientIP(request) + request.getHeader(HttpHeaders.USER_AGENT));
        ResponseModel responseModel = behaviorCaptchaService.get(captchaReq);
        CheckUtils.throwIf(() -> !StrUtil.equals(RepCodeEnum.SUCCESS.getCode(), responseModel
                                                 .getRepCode()), responseModel.getRepMsg());
        return responseModel.getRepData();
    }

    @Log(ignore = true)
    @Operation(summary = "校验行为验证码", description = "校验行为验证码")
    @PostMapping("/behavior")
    public Object checkBehaviorCaptcha(@RequestBody CaptchaVO captchaReq, HttpServletRequest request) {
        captchaReq.setBrowserInfo(JakartaServletUtil.getClientIP(request) + request.getHeader(HttpHeaders.USER_AGENT));
        return behaviorCaptchaService.check(captchaReq);
    }

    @Log(ignore = true)
    @Operation(summary = "获取图片验证码", description = "获取图片验证码（Base64编码，带图片格式：data:image/gif;base64）")
    @GetMapping("/image")
    public CaptchaResp getImageCaptcha() {
        String uuid = IdUtil.fastUUID();
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + uuid;
        Captcha captcha = graphicCaptchaService.getCaptcha();
        long expireTime = LocalDateTimeUtil.toEpochMilli(LocalDateTime.now()
                                                         .plusMinutes(captchaProperties.getExpirationInMinutes()));
        RedisUtils.set(captchaKey, captcha.text(), Duration.ofMinutes(captchaProperties.getExpirationInMinutes()));
        return CaptchaResp.builder().uuid(uuid).img(captcha.toBase64()).expireTime(expireTime).build();
    }

    /**
     * 获取邮箱验证码
     *
     * <p>
     * 限流规则：<br>
     * 1.同一邮箱同一模板，1分钟2条，1小时8条，24小时20条 <br>
     * 2、同一邮箱所有模板 24 小时 100 条 <br>
     * 3、同一 IP 每分钟限制发送 30 条
     * </p>
     * 
     * @param email 邮箱
     * @return /
     */
    @Operation(summary = "获取邮箱验证码", description = "发送验证码到指定邮箱")
    @GetMapping("/mail")
    @RateLimiters({
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "MIN", key = "#email + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.mail.templatePath')", rate = 2, interval = 1, unit = RateIntervalUnit.MINUTES, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "HOUR", key = "#email + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.mail.templatePath')", rate = 8, interval = 1, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "DAY'", key = "#email + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.mail.templatePath')", rate = 20, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#email", rate = 100, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#email", rate = 30, interval = 1, unit = RateIntervalUnit.MINUTES, type = LimitType.IP, message = "获取验证码操作太频繁，请稍后再试")})
    public R getMailCaptcha(@NotBlank(message = "邮箱不能为空") @Pattern(regexp = RegexPool.EMAIL, message = "邮箱格式错误") String email) throws MessagingException {
        // 生成验证码
        CaptchaProperties.CaptchaMail captchaMail = captchaProperties.getMail();
        String captcha = RandomUtil.randomNumbers(captchaMail.getLength());
        // 发送验证码
        Long expirationInMinutes = captchaMail.getExpirationInMinutes();
        Map<String, String> siteConfig = optionService.getByCategory("SITE");
        String content = TemplateUtils.render(captchaMail.getTemplatePath(), Dict.create()
            .set("siteUrl", projectProperties.getUrl())
            .set("siteTitle", siteConfig.get("SITE_TITLE"))
            .set("siteCopyright", siteConfig.get("SITE_COPYRIGHT"))
            .set("captcha", captcha)
            .set("expiration", expirationInMinutes));
        MailUtils.sendHtml(email, "【%s】邮箱验证码".formatted(projectProperties.getName()), content);
        // 保存验证码
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + email;
        RedisUtils.set(captchaKey, captcha, Duration.ofMinutes(expirationInMinutes));
        return R.ok("发送成功，验证码有效期 %s 分钟".formatted(expirationInMinutes));
    }

    /**
     * 获取短信验证码
     *
     * <p>
     * 限流规则：<br>
     * 1.同一号码同一模板，1分钟2条，1小时8条，24小时20条 <br>
     * 2、同一号码所有模板 24 小时 100 条 <br>
     * 3、同一 IP 每分钟限制发送 30 条
     * </p>
     * 
     * @param phone      手机号
     * @param captchaReq 行为验证码信息
     * @return /
     */
    @Operation(summary = "获取短信验证码", description = "发送验证码到指定手机号")
    @GetMapping("/sms")
    @RateLimiters({
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "MIN", key = "#phone + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.sms.templateId')", rate = 2, interval = 1, unit = RateIntervalUnit.MINUTES, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "HOUR", key = "#phone + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.sms.templateId')", rate = 8, interval = 1, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX + "DAY'", key = "#phone + ':' + T(cn.hutool.extra.spring.SpringUtil).getProperty('captcha.sms.templateId')", rate = 20, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#phone", rate = 100, interval = 24, unit = RateIntervalUnit.HOURS, message = "获取验证码操作太频繁，请稍后再试"),
        @RateLimiter(name = CacheConstants.CAPTCHA_KEY_PREFIX, key = "#phone", rate = 30, interval = 1, unit = RateIntervalUnit.MINUTES, type = LimitType.IP, message = "获取验证码操作太频繁，请稍后再试")})
    public R getSmsCaptcha(@NotBlank(message = "手机号不能为空") @Pattern(regexp = RegexPool.MOBILE, message = "手机号格式错误") String phone,
                           CaptchaVO captchaReq) {
        // 行为验证码校验
        ResponseModel verificationRes = behaviorCaptchaService.verification(captchaReq);
        ValidationUtils.throwIfNotEqual(verificationRes.getRepCode(), RepCodeEnum.SUCCESS.getCode(), verificationRes
            .getRepMsg());
        CaptchaProperties.CaptchaSms captchaSms = captchaProperties.getSms();
        // 生成验证码
        String captcha = RandomUtil.randomNumbers(captchaSms.getLength());
        // 发送验证码
        Long expirationInMinutes = captchaSms.getExpirationInMinutes();
        SmsBlend smsBlend = SmsFactory.getBySupplier(SupplierConstant.CLOOPEN);
        Map<String, String> messageMap = MapUtil.newHashMap(2, true);
        messageMap.put("captcha", captcha);
        messageMap.put("expirationInMinutes", String.valueOf(expirationInMinutes));
        SmsResponse smsResponse = smsBlend.sendMessage(phone, captchaSms
            .getTemplateId(), (LinkedHashMap<String, String>)messageMap);
        CheckUtils.throwIf(!smsResponse.isSuccess(), "验证码发送失败");
        // 保存验证码
        String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + phone;
        RedisUtils.set(captchaKey, captcha, Duration.ofMinutes(expirationInMinutes));
        return R.ok("发送成功，验证码有效期 %s 分钟".formatted(expirationInMinutes));
    }
}
```

这段代码是 `CaptchaController` 类中的一个方法，具体来说是处理获取短信验证码的请求。下面我们逐步分析这段代码的每个部分及其功能。
## 解析
### 方法签名
```java
@Operation(summary = "获取短信验证码", description = "发送验证码到指定手机号")
@GetMapping("/sms")
@RateLimiters({ ... })
public R getSmsCaptcha(@NotBlank(message = "手机号不能为空") 
                       @Pattern(regexp = RegexPool.MOBILE, message = "手机号格式错误") String phone,
                       CaptchaVO captchaReq) {
```


+ `@Operation`: 该注解用于描述 OpenAPI 文档中的操作。此处表示该方法的功能是 "获取短信验证码"。
+ `@GetMapping("/sms")`: 映射 GET 请求到 `/captcha/sms` 路径。
+ `@RateLimiters`: 该注解设置了对请求频率的限制规则，包括分钟、小时、天以及 IP 限制等，防止用户过于频繁地请求验证码。
+ `@NotBlank` 和 `@Pattern`: 在方法参数中对 `phone` 参数进行验证，确保其不为空且符合手机号的格式要求。
+ `public R getSmsCaptcha(...)`: 方法返回类型为 `R` （通常是一个标准响应封装），方法接受手机号和行为验证码请求对象 `captchaReq`。

### 方法主体
```java
// 行为验证码校验
ResponseModel verificationRes = behaviorCaptchaService.verification(captchaReq);
ValidationUtils.throwIfNotEqual(verificationRes.getRepCode(), RepCodeEnum.SUCCESS.getCode(), verificationRes.getRepMsg());
```


+ 首先调用 `behaviorCaptchaService.verification` 方法来校验用户提供的行为验证码。
+ 使用 `ValidationUtils.throwIfNotEqual` 方法检查 `verificationRes` 的返回代码，若不等于预期的成功代码，则抛出异常并返回对应的错误信息。

### 生成验证码
```java
CaptchaProperties.CaptchaSms captchaSms = captchaProperties.getSms();
// 生成验证码
String captcha = RandomUtil.randomNumbers(captchaSms.getLength());
```


+ 从 `captchaProperties` 获取短信验证码相关的配置。
+ 使用 `RandomUtil.randomNumbers` 方法生成一个指定长度的随机数字，作为短信验证码。

### 发送验证码
```java
Long expirationInMinutes = captchaSms.getExpirationInMinutes();
SmsBlend smsBlend = SmsFactory.getBySupplier(SupplierConstant.CLOOPEN);
Map<String, String> messageMap = MapUtil.newHashMap(2, true);
messageMap.put("captcha", captcha);
messageMap.put("expirationInMinutes", String.valueOf(expirationInMinutes));
SmsResponse smsResponse = smsBlend.sendMessage(phone, captchaSms.getTemplateId(), (LinkedHashMap<String, String>)messageMap);
CheckUtils.throwIf(!smsResponse.isSuccess(), "验证码发送失败");
```


+ 获取验证码的有效期（以分钟为单位）。
+ 使用 `SmsFactory` 根据供应商信息获取 `SmsBlend` 实例，以便发送短信。
+ 创建一个消息映射，将生成的验证码和过期时间放入一个 `Map` 中，以便在发送短信时使用。
+ 调用 `smsBlend.sendMessage` 方法发送短信，传入目标手机号、模板 ID 和消息内容。
+ 检查 `smsResponse` 是否表示成功，若不成功则抛出“验证码发送失败”的异常。

### 保存验证码
```java
// 保存验证码
String captchaKey = CacheConstants.CAPTCHA_KEY_PREFIX + phone;
RedisUtils.set(captchaKey, captcha, Duration.ofMinutes(expirationInMinutes));
```



+ 生成存储验证码的 Redis 键，通常会使用手机号作为关键标识。
+ 将生成的验证码和过期时间存储在 Redis 中，以便后续进行验证。

### 返回结果
```java
return R.ok("发送成功，验证码有效期 %s 分钟".formatted(expirationInMinutes));
```



+ 返回一个成功的响应，包含验证码的有效时间。

### 总结
这段代码实现了获取短信验证码的功能，进行了一系列必要的验证和操作，包括：

1. 确保手机号有效且已通过行为验证码验证。
2. 生成随机验证码并设置其有效期。
3. 调用短信服务发送验证码到用户手机。
4. 存储验证码以便后续验证。
5. 返回操作结果。

通过这些步骤，确保用户能够安全高效地获取短信验证码，同时防止滥用。