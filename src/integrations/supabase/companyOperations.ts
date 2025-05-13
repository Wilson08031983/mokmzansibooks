
import { supabase } from "./client";
import { CompanyDetails } from "@/types/company";
import { Json } from "./types";

/**
 * Fetch company data from Supabase
 */
export async function fetchCompanyData(): Promise<CompanyDetails[] | null> {
  try {
    const { data, error } = await supabase
      .from('company_data')
      .select('*')
      .eq('type', 'company');

    if (error) {
      console.error('Error fetching company data:', error);
      return null;
    }

    // Transform the data to match our CompanyDetails type
    return data.map((item) => {
      // Need to cast the JSON data to CompanyDetails
      return item.data as unknown as CompanyDetails;
    });
  } catch (error) {
    console.error('Error in fetchCompanyData:', error);
    return null;
  }
}

/**
 * Save company data to Supabase
 */
export async function saveCompanyData(companyDetails: CompanyDetails): Promise<boolean> {
  try {
    // First check if the company already exists
    const { data: existingData, error: fetchError } = await supabase
      .from('company_data')
      .select('id')
      .eq('type', 'company')
      .limit(1);

    if (fetchError) {
      console.error('Error checking existing company data:', fetchError);
      return false;
    }

    const updatedData = {
      ...companyDetails,
      updatedAt: new Date().toISOString()
    };

    if (existingData && existingData.length > 0) {
      // Update existing company
      const { error: updateError } = await supabase
        .from('company_data')
        .update({
          data: updatedData as unknown as Json
        })
        .eq('id', existingData[0].id);

      if (updateError) {
        console.error('Error updating company data:', updateError);
        return false;
      }
    } else {
      // Insert new company
      const { error: insertError } = await supabase
        .from('company_data')
        .insert({
          type: 'company',
          data: updatedData as unknown as Json
        });

      if (insertError) {
        console.error('Error inserting company data:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in saveCompanyData:', error);
    return false;
  }
}

/**
 * Delete company data from Supabase
 */
export async function deleteCompanyData(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('company_data')
      .delete()
      .eq('type', 'company');

    if (error) {
      console.error('Error deleting company data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCompanyData:', error);
    return false;
  }
}

/**
 * Backup company data to Supabase
 */
export async function backupCompanyData(companyDetails: CompanyDetails): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('company_data')
      .insert({
        type: 'company_backup',
        data: companyDetails as unknown as Json
      });

    if (error) {
      console.error('Error backing up company data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in backupCompanyData:', error);
    return false;
  }
}

/**
 * Fetch company data backups from Supabase
 */
export async function fetchCompanyDataBackups(): Promise<{id: string, data: CompanyDetails, created_at: string}[] | null> {
  try {
    const { data, error } = await supabase
      .from('company_data')
      .select('id, data, created_at')
      .eq('type', 'company_backup')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching company backups:', error);
      return null;
    }

    return data.map(item => ({
      id: item.id,
      data: item.data as unknown as CompanyDetails,
      created_at: item.created_at
    }));
  } catch (error) {
    console.error('Error in fetchCompanyDataBackups:', error);
    return null;
  }
}
