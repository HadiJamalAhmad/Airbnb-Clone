drop extension if exists "pg_net";


  create table "public"."Booking" (
    "id" text not null,
    "profileId" text not null,
    "propertyId" text not null,
    "orderTotal" integer not null,
    "totalNights" integer not null,
    "checkIn" timestamp(3) without time zone not null,
    "checkOut" timestamp(3) without time zone not null,
    "paymentStatus" boolean not null default false,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );


alter table "public"."Booking" enable row level security;


  create table "public"."Favorite" (
    "id" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "profileId" text not null,
    "propertyId" text not null
      );


alter table "public"."Favorite" enable row level security;


  create table "public"."Profile" (
    "id" text not null,
    "clerkId" text not null,
    "firstName" text not null,
    "lastName" text not null,
    "username" text not null,
    "email" text not null,
    "profileImage" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );


alter table "public"."Profile" enable row level security;


  create table "public"."Property" (
    "id" text not null,
    "name" text not null,
    "tagline" text not null,
    "category" text not null,
    "image" text not null,
    "country" text not null,
    "description" text not null,
    "price" integer not null,
    "guests" integer not null,
    "bedrooms" integer not null,
    "beds" integer not null,
    "baths" integer not null,
    "amenities" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null,
    "profileId" text not null
      );


alter table "public"."Property" enable row level security;


  create table "public"."Review" (
    "id" text not null,
    "profileId" text not null,
    "propertyId" text not null,
    "rating" integer not null,
    "comment" text not null,
    "createdAt" timestamp(3) without time zone not null default CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) without time zone not null
      );


alter table "public"."Review" enable row level security;

CREATE UNIQUE INDEX "Booking_pkey" ON public."Booking" USING btree (id);

CREATE UNIQUE INDEX "Favorite_pkey" ON public."Favorite" USING btree (id);

CREATE UNIQUE INDEX "Profile_clerkId_key" ON public."Profile" USING btree ("clerkId");

CREATE UNIQUE INDEX "Profile_pkey" ON public."Profile" USING btree (id);

CREATE UNIQUE INDEX "Property_pkey" ON public."Property" USING btree (id);

CREATE UNIQUE INDEX "Review_pkey" ON public."Review" USING btree (id);

alter table "public"."Booking" add constraint "Booking_pkey" PRIMARY KEY using index "Booking_pkey";

alter table "public"."Favorite" add constraint "Favorite_pkey" PRIMARY KEY using index "Favorite_pkey";

alter table "public"."Profile" add constraint "Profile_pkey" PRIMARY KEY using index "Profile_pkey";

alter table "public"."Property" add constraint "Property_pkey" PRIMARY KEY using index "Property_pkey";

alter table "public"."Review" add constraint "Review_pkey" PRIMARY KEY using index "Review_pkey";

alter table "public"."Booking" add constraint "Booking_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"("clerkId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Booking" validate constraint "Booking_profileId_fkey";

alter table "public"."Booking" add constraint "Booking_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Booking" validate constraint "Booking_propertyId_fkey";

alter table "public"."Favorite" add constraint "Favorite_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"("clerkId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Favorite" validate constraint "Favorite_profileId_fkey";

alter table "public"."Favorite" add constraint "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Favorite" validate constraint "Favorite_propertyId_fkey";

alter table "public"."Property" add constraint "Property_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"("clerkId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Property" validate constraint "Property_profileId_fkey";

alter table "public"."Review" add constraint "Review_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES public."Profile"("clerkId") ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Review" validate constraint "Review_profileId_fkey";

alter table "public"."Review" add constraint "Review_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES public."Property"(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."Review" validate constraint "Review_propertyId_fkey";

grant delete on table "public"."Booking" to "anon";

grant insert on table "public"."Booking" to "anon";

grant references on table "public"."Booking" to "anon";

grant select on table "public"."Booking" to "anon";

grant trigger on table "public"."Booking" to "anon";

grant truncate on table "public"."Booking" to "anon";

grant update on table "public"."Booking" to "anon";

grant delete on table "public"."Booking" to "authenticated";

grant insert on table "public"."Booking" to "authenticated";

grant references on table "public"."Booking" to "authenticated";

grant select on table "public"."Booking" to "authenticated";

grant trigger on table "public"."Booking" to "authenticated";

grant truncate on table "public"."Booking" to "authenticated";

grant update on table "public"."Booking" to "authenticated";

grant delete on table "public"."Booking" to "service_role";

grant insert on table "public"."Booking" to "service_role";

grant references on table "public"."Booking" to "service_role";

grant select on table "public"."Booking" to "service_role";

grant trigger on table "public"."Booking" to "service_role";

grant truncate on table "public"."Booking" to "service_role";

grant update on table "public"."Booking" to "service_role";

grant delete on table "public"."Favorite" to "anon";

grant insert on table "public"."Favorite" to "anon";

grant references on table "public"."Favorite" to "anon";

grant select on table "public"."Favorite" to "anon";

grant trigger on table "public"."Favorite" to "anon";

grant truncate on table "public"."Favorite" to "anon";

grant update on table "public"."Favorite" to "anon";

grant delete on table "public"."Favorite" to "authenticated";

grant insert on table "public"."Favorite" to "authenticated";

grant references on table "public"."Favorite" to "authenticated";

grant select on table "public"."Favorite" to "authenticated";

grant trigger on table "public"."Favorite" to "authenticated";

grant truncate on table "public"."Favorite" to "authenticated";

grant update on table "public"."Favorite" to "authenticated";

grant delete on table "public"."Favorite" to "service_role";

grant insert on table "public"."Favorite" to "service_role";

grant references on table "public"."Favorite" to "service_role";

grant select on table "public"."Favorite" to "service_role";

grant trigger on table "public"."Favorite" to "service_role";

grant truncate on table "public"."Favorite" to "service_role";

grant update on table "public"."Favorite" to "service_role";

grant delete on table "public"."Profile" to "anon";

grant insert on table "public"."Profile" to "anon";

grant references on table "public"."Profile" to "anon";

grant select on table "public"."Profile" to "anon";

grant trigger on table "public"."Profile" to "anon";

grant truncate on table "public"."Profile" to "anon";

grant update on table "public"."Profile" to "anon";

grant delete on table "public"."Profile" to "authenticated";

grant insert on table "public"."Profile" to "authenticated";

grant references on table "public"."Profile" to "authenticated";

grant select on table "public"."Profile" to "authenticated";

grant trigger on table "public"."Profile" to "authenticated";

grant truncate on table "public"."Profile" to "authenticated";

grant update on table "public"."Profile" to "authenticated";

grant delete on table "public"."Profile" to "service_role";

grant insert on table "public"."Profile" to "service_role";

grant references on table "public"."Profile" to "service_role";

grant select on table "public"."Profile" to "service_role";

grant trigger on table "public"."Profile" to "service_role";

grant truncate on table "public"."Profile" to "service_role";

grant update on table "public"."Profile" to "service_role";

grant delete on table "public"."Property" to "anon";

grant insert on table "public"."Property" to "anon";

grant references on table "public"."Property" to "anon";

grant select on table "public"."Property" to "anon";

grant trigger on table "public"."Property" to "anon";

grant truncate on table "public"."Property" to "anon";

grant update on table "public"."Property" to "anon";

grant delete on table "public"."Property" to "authenticated";

grant insert on table "public"."Property" to "authenticated";

grant references on table "public"."Property" to "authenticated";

grant select on table "public"."Property" to "authenticated";

grant trigger on table "public"."Property" to "authenticated";

grant truncate on table "public"."Property" to "authenticated";

grant update on table "public"."Property" to "authenticated";

grant delete on table "public"."Property" to "service_role";

grant insert on table "public"."Property" to "service_role";

grant references on table "public"."Property" to "service_role";

grant select on table "public"."Property" to "service_role";

grant trigger on table "public"."Property" to "service_role";

grant truncate on table "public"."Property" to "service_role";

grant update on table "public"."Property" to "service_role";

grant delete on table "public"."Review" to "anon";

grant insert on table "public"."Review" to "anon";

grant references on table "public"."Review" to "anon";

grant select on table "public"."Review" to "anon";

grant trigger on table "public"."Review" to "anon";

grant truncate on table "public"."Review" to "anon";

grant update on table "public"."Review" to "anon";

grant delete on table "public"."Review" to "authenticated";

grant insert on table "public"."Review" to "authenticated";

grant references on table "public"."Review" to "authenticated";

grant select on table "public"."Review" to "authenticated";

grant trigger on table "public"."Review" to "authenticated";

grant truncate on table "public"."Review" to "authenticated";

grant update on table "public"."Review" to "authenticated";

grant delete on table "public"."Review" to "service_role";

grant insert on table "public"."Review" to "service_role";

grant references on table "public"."Review" to "service_role";

grant select on table "public"."Review" to "service_role";

grant trigger on table "public"."Review" to "service_role";

grant truncate on table "public"."Review" to "service_role";

grant update on table "public"."Review" to "service_role";


  create policy "Guests can insert own bookings"
  on "public"."Booking"
  as permissive
  for insert
  to public
with check (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Booking"."profileId"))));



  create policy "Guests can update own bookings"
  on "public"."Booking"
  as permissive
  for update
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Booking"."profileId"))));



  create policy "Guests can view own bookings"
  on "public"."Booking"
  as permissive
  for select
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Booking"."profileId"))));



  create policy "Hosts can view bookings on their properties"
  on "public"."Booking"
  as permissive
  for select
  to public
using (((auth.uid())::text = ( SELECT p."clerkId"
   FROM (public."Profile" p
     JOIN public."Property" pr ON ((pr."profileId" = p.id)))
  WHERE (pr.id = "Booking"."propertyId"))));



  create policy "Users can delete own favorites"
  on "public"."Favorite"
  as permissive
  for delete
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Favorite"."profileId"))));



  create policy "Users can insert own favorites"
  on "public"."Favorite"
  as permissive
  for insert
  to public
with check (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Favorite"."profileId"))));



  create policy "Users can view own favorites"
  on "public"."Favorite"
  as permissive
  for select
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Favorite"."profileId"))));



  create policy "Users can insert own profile"
  on "public"."Profile"
  as permissive
  for insert
  to public
with check (((auth.uid())::text = "clerkId"));



  create policy "Users can update own profile"
  on "public"."Profile"
  as permissive
  for update
  to public
using (((auth.uid())::text = "clerkId"));



  create policy "Users can view own profile"
  on "public"."Profile"
  as permissive
  for select
  to public
using (((auth.uid())::text = "clerkId"));



  create policy "Anyone can view properties"
  on "public"."Property"
  as permissive
  for select
  to public
using (true);



  create policy "Hosts can delete own properties"
  on "public"."Property"
  as permissive
  for delete
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Property"."profileId"))));



  create policy "Hosts can insert own properties"
  on "public"."Property"
  as permissive
  for insert
  to public
with check (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Property"."profileId"))));



  create policy "Hosts can update own properties"
  on "public"."Property"
  as permissive
  for update
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Property"."profileId"))));



  create policy "Anyone can view reviews"
  on "public"."Review"
  as permissive
  for select
  to public
using (true);



  create policy "Users can delete own reviews"
  on "public"."Review"
  as permissive
  for delete
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Review"."profileId"))));



  create policy "Users can insert own reviews"
  on "public"."Review"
  as permissive
  for insert
  to public
with check (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Review"."profileId"))));



  create policy "Users can update own reviews"
  on "public"."Review"
  as permissive
  for update
  to public
using (((auth.uid())::text = ( SELECT "Profile"."clerkId"
   FROM public."Profile"
  WHERE ("Profile".id = "Review"."profileId"))));



