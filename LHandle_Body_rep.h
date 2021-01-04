#ifndef TEST_PROJECT_LHANDLE_BODY_REP_H_
#define TEST_PROJECT_LHANDLE_BODY_REP_H_

class String_Rep
{
    public:
        // PUBLIC CONSTRUCTORS
        String_Rep ();
        String_Rep (const String_Rep & s);
        String_Rep (const char * s);
        // PUBLIC DESTRUCTORS
        ~String_Rep ();
        // PUBLIC METHODS
        const char * get ();
        void set (const char * s);
        // PUBLIC OPERATOR OVERLOADS
        String_Rep & operator= (const char * s);
    protected:
    private:
        // PRIVATE VARIABLES
        int a;
        String_Rep * other_string;
};

#endif // TEST_PROJECT_LHANDLE_BODY_REP_H_
