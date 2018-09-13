
public class Foo {

    private String type;

    /**
     * No args constructor for use in serialization
     * 
     */
    public Foo() {
    }

    /**
     * 
     * @param type
     */
    public Foo(String type) {
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
