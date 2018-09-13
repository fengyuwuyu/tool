
public class Properties {

    private Foo foo;
    private Bar bar;
    private Baz baz;

    /**
     * No args constructor for use in serialization
     * 
     */
    public Properties() {
    }

    /**
     * 
     * @param bar
     * @param foo
     * @param baz
     */
    public Properties(Foo foo, Bar bar, Baz baz) {
        super();
        this.foo = foo;
        this.bar = bar;
        this.baz = baz;
    }

    public Foo getFoo() {
        return foo;
    }

    public void setFoo(Foo foo) {
        this.foo = foo;
    }

    public Bar getBar() {
        return bar;
    }

    public void setBar(Bar bar) {
        this.bar = bar;
    }

    public Baz getBaz() {
        return baz;
    }

    public void setBaz(Baz baz) {
        this.baz = baz;
    }

}
