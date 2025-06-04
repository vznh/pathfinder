


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "authenticated";


ALTER SCHEMA "authenticated" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."organization_type" AS ENUM (
    'club',
    'college'
);


ALTER TYPE "public"."organization_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  insert into public.profiles_v0 (id, email)
  values (new.id, new.email);
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_email_domain"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$ BEGIN IF ( NEW.email ILIKE '%@ucsc.edu') THEN 
RETURN NEW; ELSE 
RAISE EXCEPTION 'Wrong email.'; 
END IF; END; $$;


ALTER FUNCTION "public"."verify_email_domain"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "authenticated"."events_v0" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event" "text",
    "latitude" double precision,
    "longitude" double precision,
    "user_id" "uuid",
    "organization_id" "uuid",
    "type" "text",
    "date" "date",
    "start_time" time without time zone,
    "end_time" time without time zone,
    "description" "text"
);


ALTER TABLE "authenticated"."events_v0" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "authenticated"."organizations_v0" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text",
    "type" "public"."organization_type"
);


ALTER TABLE "authenticated"."organizations_v0" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "authenticated"."profiles_v0" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "email" character varying
);


ALTER TABLE "authenticated"."profiles_v0" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "authenticated"."users_attending_events_v0" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "event_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "authenticated"."users_attending_events_v0" OWNER TO "postgres";


CREATE OR REPLACE VIEW "authenticated"."rsvp_count" AS
 SELECT "users_attending_events_v0"."event_id",
    "count"("users_attending_events_v0"."event_id") AS "rsvps"
   FROM "authenticated"."users_attending_events_v0"
  GROUP BY "users_attending_events_v0"."event_id";


ALTER TABLE "authenticated"."rsvp_count" OWNER TO "postgres";


CREATE OR REPLACE VIEW "authenticated"."events" WITH ("security_invoker"='true') AS
 SELECT "e"."event",
    "e"."latitude",
    "e"."longitude",
    "e"."type",
    "e"."date",
    "e"."start_time",
    "e"."end_time",
    "e"."description",
    "o"."name" AS "organization_name",
    "p"."email" AS "user_email",
    COALESCE("r"."rsvps", (0)::bigint) AS "rsvp_count",
    "e"."id"
   FROM ((("authenticated"."events_v0" "e"
     LEFT JOIN "authenticated"."profiles_v0" "p" ON (("e"."user_id" = "p"."id")))
     LEFT JOIN "authenticated"."organizations_v0" "o" ON (("e"."organization_id" = "o"."id")))
     LEFT JOIN "authenticated"."rsvp_count" "r" ON (("r"."event_id" = "e"."id")));


ALTER TABLE "authenticated"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "authenticated"."subscriptions_v0" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid",
    "user_id" "uuid"
);


ALTER TABLE "authenticated"."subscriptions_v0" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "authenticated"."user_organizations_v0" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL
);


ALTER TABLE "authenticated"."user_organizations_v0" OWNER TO "postgres";


CREATE OR REPLACE VIEW "authenticated"."organizations" WITH ("security_invoker"='on') AS
 SELECT "o"."id",
    "o"."name",
        CASE
            WHEN ("uo"."user_id" IS NULL) THEN false
            ELSE true
        END AS "user_is_part_of_org",
        CASE
            WHEN ("s"."user_id" IS NULL) THEN false
            ELSE true
        END AS "user_is_subscribed_to_org"
   FROM (("authenticated"."organizations_v0" "o"
     LEFT JOIN ( SELECT "user_organizations_v0"."id",
            "user_organizations_v0"."created_at",
            "user_organizations_v0"."user_id",
            "user_organizations_v0"."organization_id"
           FROM "authenticated"."user_organizations_v0"
          WHERE ("user_organizations_v0"."user_id" = "auth"."uid"())) "uo" ON (("o"."id" = "uo"."organization_id")))
     LEFT JOIN ( SELECT "subscriptions_v0"."id",
            "subscriptions_v0"."created_at",
            "subscriptions_v0"."organization_id",
            "subscriptions_v0"."user_id"
           FROM "authenticated"."subscriptions_v0"
          WHERE ("subscriptions_v0"."user_id" = "auth"."uid"())) "s" ON (("o"."id" = "s"."organization_id")));


ALTER TABLE "authenticated"."organizations" OWNER TO "postgres";


ALTER TABLE ONLY "authenticated"."events_v0"
    ADD CONSTRAINT "events_v0_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "authenticated"."organizations_v0"
    ADD CONSTRAINT "organizations_v0_name_key" UNIQUE ("name");



ALTER TABLE ONLY "authenticated"."organizations_v0"
    ADD CONSTRAINT "organizations_v0_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "authenticated"."profiles_v0"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "authenticated"."subscriptions_v0"
    ADD CONSTRAINT "subscriptions_v0_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "authenticated"."users_attending_events_v0"
    ADD CONSTRAINT "uq_users_attending_events_v0" UNIQUE ("user_id", "event_id");



ALTER TABLE ONLY "authenticated"."user_organizations_v0"
    ADD CONSTRAINT "user_organizations_v0_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "authenticated"."users_attending_events_v0"
    ADD CONSTRAINT "users_attending_events_v0_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "onEventInsert" AFTER INSERT ON "authenticated"."events_v0" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://glwfdizzgverycrnoiqw.supabase.co/functions/v1/onEventInsert', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsd2ZkaXp6Z3Zlcnljcm5vaXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI2NjMwNywiZXhwIjoyMDYwODQyMzA3fQ.FzF7lDXJtAb6qxmGqw-bqxroO1RdpndbVyv1H0LHWjk"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "test_format" AFTER INSERT ON "authenticated"."events_v0" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://glwfdizzgverycrnoiqw.supabase.co/functions/v1/quick-worker', 'POST', '{"Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdsd2ZkaXp6Z3Zlcnljcm5vaXF3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTI2NjMwNywiZXhwIjoyMDYwODQyMzA3fQ.FzF7lDXJtAb6qxmGqw-bqxroO1RdpndbVyv1H0LHWjk"}', '{}', '5000');



ALTER TABLE ONLY "authenticated"."events_v0"
    ADD CONSTRAINT "events_v0_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "authenticated"."organizations_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."events_v0"
    ADD CONSTRAINT "events_v0_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "authenticated"."profiles_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."profiles_v0"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."subscriptions_v0"
    ADD CONSTRAINT "subscriptions_v0_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "authenticated"."organizations_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."subscriptions_v0"
    ADD CONSTRAINT "subscriptions_v0_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "authenticated"."profiles_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."user_organizations_v0"
    ADD CONSTRAINT "user_organizations_v0_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "authenticated"."organizations_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."user_organizations_v0"
    ADD CONSTRAINT "user_organizations_v0_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "authenticated"."profiles_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."users_attending_events_v0"
    ADD CONSTRAINT "users_attending_events_v0_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "authenticated"."events_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "authenticated"."users_attending_events_v0"
    ADD CONSTRAINT "users_attending_events_v0_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "authenticated"."profiles_v0"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "ALlows user to delete based on user_id" ON "authenticated"."events_v0" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Allow user to delete based on user id" ON "authenticated"."users_attending_events_v0" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Allow users to insert based on org id" ON "authenticated"."events_v0" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" IS NULL) AND ("organization_id" IN ( SELECT "user_organizations_v0"."organization_id"
   FROM "authenticated"."user_organizations_v0"
  WHERE ("user_organizations_v0"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



CREATE POLICY "Allow users to insert based on user id" ON "authenticated"."users_attending_events_v0" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Allow users to select based on user_id" ON "authenticated"."users_attending_events_v0" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable insert for users based on user_id" ON "authenticated"."events_v0" FOR INSERT TO "authenticated" WITH CHECK ((("organization_id" IS NULL) AND (( SELECT "auth"."uid"() AS "uid") = "user_id")));



CREATE POLICY "Enable insert for users based on user_id" ON "authenticated"."subscriptions_v0" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable read access" ON "authenticated"."events_v0" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access if authenticated" ON "authenticated"."organizations_v0" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable select for users based on user_id" ON "authenticated"."user_organizations_v0" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable update for users based on user_id" ON "authenticated"."events_v0" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "allow select for auth" ON "authenticated"."profiles_v0" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "delete on org id" ON "authenticated"."events_v0" FOR DELETE TO "authenticated" USING (("organization_id" IN ( SELECT "user_organizations_v0"."organization_id"
   FROM "authenticated"."user_organizations_v0"
  WHERE ("user_organizations_v0"."user_id" = ( SELECT "auth"."uid"() AS "uid")))));



CREATE POLICY "delete on user id" ON "authenticated"."subscriptions_v0" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "authenticated"."events_v0" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "authenticated"."organizations_v0" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "authenticated"."profiles_v0" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "select on user id" ON "authenticated"."subscriptions_v0" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "authenticated"."subscriptions_v0" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update for orgs" ON "authenticated"."events_v0" FOR UPDATE TO "authenticated" USING (("organization_id" IN ( SELECT "user_organizations_v0"."organization_id"
   FROM "authenticated"."user_organizations_v0"
  WHERE ("user_organizations_v0"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK ((("user_id" IS NULL) AND ("organization_id" IN ( SELECT "user_organizations_v0"."organization_id"
   FROM "authenticated"."user_organizations_v0"
  WHERE ("user_organizations_v0"."user_id" = ( SELECT "auth"."uid"() AS "uid"))))));



ALTER TABLE "authenticated"."user_organizations_v0" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "authenticated"."users_attending_events_v0" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "authenticated" TO "authenticated";
GRANT USAGE ON SCHEMA "authenticated" TO "service_role";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_email_domain"() TO "anon";
GRANT ALL ON FUNCTION "public"."verify_email_domain"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_email_domain"() TO "service_role";












GRANT ALL ON TABLE "authenticated"."events_v0" TO "anon";
GRANT ALL ON TABLE "authenticated"."events_v0" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."events_v0" TO "service_role";



GRANT ALL ON TABLE "authenticated"."organizations_v0" TO "anon";
GRANT ALL ON TABLE "authenticated"."organizations_v0" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."organizations_v0" TO "service_role";



GRANT ALL ON TABLE "authenticated"."profiles_v0" TO "anon";
GRANT ALL ON TABLE "authenticated"."profiles_v0" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."profiles_v0" TO "service_role";



GRANT ALL ON TABLE "authenticated"."users_attending_events_v0" TO "anon";
GRANT ALL ON TABLE "authenticated"."users_attending_events_v0" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."users_attending_events_v0" TO "service_role";



GRANT SELECT("event_id") ON TABLE "authenticated"."users_attending_events_v0" TO "authenticated";



GRANT ALL ON TABLE "authenticated"."rsvp_count" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."rsvp_count" TO "service_role";



GRANT ALL ON TABLE "authenticated"."events" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."events" TO "service_role";



GRANT ALL ON TABLE "authenticated"."subscriptions_v0" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."subscriptions_v0" TO "service_role";



GRANT ALL ON TABLE "authenticated"."user_organizations_v0" TO "anon";
GRANT ALL ON TABLE "authenticated"."user_organizations_v0" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."user_organizations_v0" TO "service_role";



GRANT ALL ON TABLE "authenticated"."organizations" TO "authenticated";
GRANT ALL ON TABLE "authenticated"."organizations" TO "service_role";















ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "authenticated" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "authenticated" GRANT ALL ON SEQUENCES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "authenticated" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "authenticated" GRANT ALL ON FUNCTIONS  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "authenticated" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "authenticated" GRANT ALL ON TABLES  TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
