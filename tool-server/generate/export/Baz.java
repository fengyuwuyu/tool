
public class Baz {

    private String type;

    /**
     * No args constructor for use in serialization
     * 
     */
    public Baz() {
    }

    /**
     * 
     * @param type
     */
    public Baz(String type) {
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
