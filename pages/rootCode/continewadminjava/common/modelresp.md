# common/model/resp
## CaptchaResp
```java
@Data
@Builder
@Schema(description = "验证码信息")
public class CaptchaResp implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 验证码标识
     */
    @Schema(description = "验证码标识", example = "090b9a2c-1691-4fca-99db-e4ed0cff362f")
    private String uuid;

    /**
     * 验证码图片（Base64编码，带图片格式：data:image/gif;base64）
     */
    @Schema(description = "验证码图片（Base64编码，带图片格式：data:image/gif;base64）", example = "data:image/png;base64,iVBORw0KGgoAAAAN...")
    private String img;

    /**
     * 过期时间戳
     */
    @Schema(description = "过期时间戳", example = "1714376969409")
    private Long expireTime;
}
```