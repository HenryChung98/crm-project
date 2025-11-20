

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


CREATE SCHEMA IF NOT EXISTS "drizzle";


ALTER SCHEMA "drizzle" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."contact_status" AS ENUM (
    'lead',
    'customer',
    'inactive'
);


ALTER TYPE "public"."contact_status" OWNER TO "postgres";


CREATE TYPE "public"."deal_stage" AS ENUM (
    'lead',
    'qualified',
    'proposal',
    'negotiation',
    'closed-won',
    'closed-lost'
);


ALTER TYPE "public"."deal_stage" OWNER TO "postgres";


CREATE TYPE "public"."organization_member_roles" AS ENUM (
    'owner',
    'admin',
    'member'
);


ALTER TYPE "public"."organization_member_roles" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'paid',
    'pending',
    'failed',
    'refunded'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."product_status" AS ENUM (
    'active',
    'inactive',
    'discontinued'
);


ALTER TYPE "public"."product_status" OWNER TO "postgres";


CREATE TYPE "public"."product_type" AS ENUM (
    'inventory',
    'non-inventory',
    'service'
);


ALTER TYPE "public"."product_type" OWNER TO "postgres";


CREATE TYPE "public"."subscription_status" AS ENUM (
    'free',
    'active',
    'inactive',
    'canceled',
    'expired'
);


ALTER TYPE "public"."subscription_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."invite_user_rpc"("p_org_id" "uuid", "p_email" "text", "p_invited_by" "uuid") RETURNS json
    LANGUAGE "plpgsql"
    AS $$
declare
  existing_member record;
  existing_invite record;
  invitation record;
  org record;
begin
  -- 중복 멤버 체크
  select * into existing_member
  from organization_members
  where organization_id = p_org_id
    and user_email = p_email
  limit 1;
  if found then
    return json_build_object('error', 'The user is already a member');
  end if;

  -- 중복 초대 체크
  select * into existing_invite
  from organization_invitations
  where organization_id = p_org_id
    and email = p_email
    and accepted = false
    and expires_at > now()
  limit 1;
  if found then
    return json_build_object('error', 'The user already invited');
  end if;

  -- 초대 생성
  insert into organization_invitations (email, organization_id, invited_by, accepted, expires_at)
  values (p_email, p_org_id, p_invited_by, false, now() + interval '7 days')
  returning id into invitation;

  -- 조직 이름 조회
  select name into org
  from organizations
  where id = p_org_id;

  return json_build_object(
    'success', true,
    'invitation_id', invitation.id,
    'org_name', org.name
  );
end;
$$;


ALTER FUNCTION "public"."invite_user_rpc"("p_org_id" "uuid", "p_email" "text", "p_invited_by" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" integer NOT NULL,
    "hash" "text" NOT NULL,
    "created_at" bigint
);


ALTER TABLE "drizzle"."__drizzle_migrations" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "drizzle"."__drizzle_migrations_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "drizzle"."__drizzle_migrations_id_seq" OWNED BY "drizzle"."__drizzle_migrations"."id";



CREATE TABLE IF NOT EXISTS "public"."activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "entity_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "entity_type" "text" NOT NULL,
    "action" "text" NOT NULL,
    "changed_data" "jsonb" NOT NULL,
    "performed_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source" "text" NOT NULL,
    "note" "text",
    "imported_data" "jsonb",
    "status" "public"."contact_status" NOT NULL,
    "job_title" "text"
);


ALTER TABLE "public"."contacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."deals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "stage" "public"."deal_stage" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "closed_at" timestamp with time zone DEFAULT "now"(),
    "note" "text"
);


ALTER TABLE "public"."deals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL,
    "invited_by" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "accepted" boolean DEFAULT false NOT NULL,
    "expires_at" timestamp with time zone NOT NULL
);


ALTER TABLE "public"."organization_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invited_by" "uuid",
    "role" "public"."organization_member_roles" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "organization_name" "text" NOT NULL,
    "user_email" character varying NOT NULL
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text",
    "email" character varying,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "city" "text" NOT NULL,
    "state_province" character varying,
    "country" "text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "url" "text",
    "subscription_id" "uuid" NOT NULL
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."organizations" IS 'Stores basic information for each company that subscribes to the service';



CREATE TABLE IF NOT EXISTS "public"."plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "price_monthly" real,
    "price_yearly" real,
    "max_users" smallint,
    "max_contacts" integer,
    "email_sender" integer,
    "track_visit" integer NOT NULL,
    "max_deals" integer NOT NULL
);


ALTER TABLE "public"."plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "type" "public"."product_type" NOT NULL,
    "price" numeric NOT NULL,
    "status" "public"."product_status" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "note" "text",
    "organization_id" "uuid" NOT NULL,
    "sku" "text" NOT NULL,
    "cost" numeric NOT NULL
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."public_form_submissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "contact_id" "uuid" NOT NULL,
    "ip_address" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."public_form_submissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "plan_id" "uuid",
    "status" "public"."subscription_status" NOT NULL,
    "starts_at" timestamp with time zone NOT NULL,
    "ends_at" timestamp with time zone NOT NULL,
    "payment_status" "public"."payment_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "auth_id" "uuid" NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."visit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "visited_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "source" "text" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "ip_address" "text" NOT NULL
);


ALTER TABLE "public"."visit_logs" OWNER TO "postgres";


ALTER TABLE ONLY "drizzle"."__drizzle_migrations" ALTER COLUMN "id" SET DEFAULT "nextval"('"drizzle"."__drizzle_migrations_id_seq"'::"regclass");



ALTER TABLE ONLY "drizzle"."__drizzle_migrations"
    ADD CONSTRAINT "__drizzle_migrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "contacts_phone_key" UNIQUE ("phone");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_key" UNIQUE ("created_by");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_id_key" UNIQUE ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_subscription_id_key" UNIQUE ("subscription_id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_url_key" UNIQUE ("url");



ALTER TABLE ONLY "public"."plans"
    ADD CONSTRAINT "plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_sku_key" UNIQUE ("sku");



ALTER TABLE ONLY "public"."public_form_submissions"
    ADD CONSTRAINT "public_form_submissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_key" UNIQUE ("auth_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."visit_logs"
    ADD CONSTRAINT "visit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."activity_logs"
    ADD CONSTRAINT "activity_logs_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."contacts"
    ADD CONSTRAINT "customers_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."deals"
    ADD CONSTRAINT "deals_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_invitations"
    ADD CONSTRAINT "organization_invitations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_name_fkey" FOREIGN KEY ("organization_name") REFERENCES "public"."organizations"("name");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."public_form_submissions"
    ADD CONSTRAINT "public_form_submissions_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."public_form_submissions"
    ADD CONSTRAINT "public_form_submissions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "public"."plans"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_auth_id_fkey" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."visit_logs"
    ADD CONSTRAINT "visit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



CREATE POLICY "Enable delete for users based on user_id" ON "public"."activity_logs" FOR DELETE USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."contacts" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "m"
  WHERE (("m"."organization_id" = "contacts"."organization_id") AND ("m"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."deals" FOR DELETE TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."organization_invitations" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "invited_by"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."organization_members" FOR DELETE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."user_id" = "auth"."uid"()) AND ("om"."organization_id" = "organization_members"."organization_id") AND ("om"."role" = 'owner'::"public"."organization_member_roles")))));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."organizations" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "created_by"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."products" FOR DELETE TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."activity_logs" FOR INSERT TO "authenticated" WITH CHECK (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."contacts" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "m"
  WHERE (("m"."organization_id" = "contacts"."organization_id") AND ("m"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."deals" FOR INSERT TO "authenticated" WITH CHECK (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."organization_invitations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."organization_members" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = "auth"."uid"()) AND ("organization_name" = ( SELECT "organizations"."name"
   FROM "public"."organizations"
  WHERE ("organizations"."id" = "organization_members"."organization_id")))));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."organizations" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."public_form_submissions" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."subscriptions" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."visit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "public"."contacts" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "m"
  WHERE (("m"."organization_id" = "contacts"."organization_id") AND ("m"."user_id" = "auth"."uid"())))));



CREATE POLICY "Enable read access for all users" ON "public"."deals" FOR SELECT TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable read access for all users" ON "public"."organization_invitations" FOR SELECT TO "authenticated" USING ((("auth"."email"() = "email") OR ("invited_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."organization_id" = "organization_invitations"."organization_id") AND ("om"."user_id" = "auth"."uid"()) AND ("om"."role" = ANY (ARRAY['owner'::"public"."organization_member_roles", 'admin'::"public"."organization_member_roles"])))))));



CREATE POLICY "Enable read access for all users" ON "public"."organizations" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."plans" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."public_form_submissions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "public"."visit_logs" FOR SELECT USING (true);



CREATE POLICY "Enable update for users based on email" ON "public"."organization_invitations" FOR UPDATE TO "authenticated" USING ((("email" = "auth"."email"()) AND ("accepted" = false))) WITH CHECK ((("email" = "auth"."email"()) AND ("accepted" = true)));



CREATE POLICY "Enable users to view their own data only" ON "public"."activity_logs" FOR SELECT TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable users to view their own data only" ON "public"."organization_members" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Enable users to view their own data only" ON "public"."products" FOR SELECT TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Enable users to view their own data only" ON "public"."subscriptions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Policy with table joins" ON "public"."contacts" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "m"
  WHERE (("m"."organization_id" = "contacts"."organization_id") AND ("m"."user_id" = "auth"."uid"())))));



CREATE POLICY "Policy with table joins" ON "public"."deals" FOR UPDATE TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Policy with table joins" ON "public"."organization_members" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members" "om"
  WHERE (("om"."user_id" = "auth"."uid"()) AND ("om"."organization_id" = "organization_members"."organization_id") AND ("om"."role" = 'owner'::"public"."organization_member_roles")))));



CREATE POLICY "Policy with table joins" ON "public"."organizations" FOR UPDATE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Policy with table joins" ON "public"."products" FOR UPDATE TO "authenticated" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Policy with table joins" ON "public"."subscriptions" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contacts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."deals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."public_form_submissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."visit_logs" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."invite_user_rpc"("p_org_id" "uuid", "p_email" "text", "p_invited_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."invite_user_rpc"("p_org_id" "uuid", "p_email" "text", "p_invited_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."invite_user_rpc"("p_org_id" "uuid", "p_email" "text", "p_invited_by" "uuid") TO "service_role";


















GRANT ALL ON TABLE "public"."activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."contacts" TO "anon";
GRANT ALL ON TABLE "public"."contacts" TO "authenticated";
GRANT ALL ON TABLE "public"."contacts" TO "service_role";



GRANT ALL ON TABLE "public"."deals" TO "anon";
GRANT ALL ON TABLE "public"."deals" TO "authenticated";
GRANT ALL ON TABLE "public"."deals" TO "service_role";



GRANT ALL ON TABLE "public"."organization_invitations" TO "anon";
GRANT ALL ON TABLE "public"."organization_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."plans" TO "anon";
GRANT ALL ON TABLE "public"."plans" TO "authenticated";
GRANT ALL ON TABLE "public"."plans" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."public_form_submissions" TO "anon";
GRANT ALL ON TABLE "public"."public_form_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."public_form_submissions" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."visit_logs" TO "anon";
GRANT ALL ON TABLE "public"."visit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."visit_logs" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























