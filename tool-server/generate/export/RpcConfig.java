
public class RpcConfig {

    private String type;
    private Properties properties;

    /**
     * No args constructor for use in serialization
     * 
     */
    public RpcConfig() {
    }

    /**
     * 
     * @param type
     * @param properties
     */
    public RpcConfig(String type, Properties properties) {
        super();
        this.type = type;
        this.properties = properties;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Properties getProperties() {
        return properties;
    }

    public void setProperties(Properties properties) {
        this.properties = properties;
    }

}
