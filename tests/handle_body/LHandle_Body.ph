// [HANDLE-BODY]
class String
{
    public:
        String();
        String(const String &s);
        const char *get ();
        void set (const char *s);
        String &operator=(const String &s);
        ~String();
        String(const char *s);

    private:
        int a;
        String *yo_mismo;
};
