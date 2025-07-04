
-- This command will delete all properties that do not have a landlord assigned.
-- This is intended to remove the initial sample data.
DELETE FROM public.properties WHERE landlord_id IS NULL;
