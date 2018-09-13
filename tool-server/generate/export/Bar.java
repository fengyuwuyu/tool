
public class Bar {

    private String type;

    /**
     * No args constructor for use in serialization
     * 
     */
    public Bar() {
    }

    /**
     * 
     * @param type
     */
    public Bar(String type) {
        super();
        this.type = type;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

}
