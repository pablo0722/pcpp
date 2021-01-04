#ifndef TEST_PROJECT_LHANDLE_BODY_H_
#define TEST_PROJECT_LHANDLE_BODY_H_

class String
{
    public:
        // PUBLIC CONSTRUCTORS
        String ();
        String (const String & s);
        String (const char * s);
        // PUBLIC DESTRUCTORS
        ~String ();
        // PUBLIC METHODS
        const char * get ();
        void set (const char * s);
        // PUBLIC OPERATOR OVERLOADS
        String & operator= (const char * s);
    protected:
    private:
};

#endif // TEST_PROJECT_LHANDLE_BODY_H_
