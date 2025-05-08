/**
 * Supabase operations for company data
 * This file contains functions to interact with the Supabase backend
 * for company-related operations
 */

import { supabase } from './client';
import { CompanyDetails } from '@/contexts/CompanyContext';
import { safeJsonParse, safeJsonStringify } from '@/utils/errorHandling';

/**
 * Save company details to Supabase
 * @param companyDetails The company details to save
 * @returns Promise resolving to the saved company details
 */
export const saveCompanyToSupabase = async (companyDetails: CompanyDetails): Promise<CompanyDetails> => {
  try {
    // Get the current user to associate with company
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No authenticated user found');
    }
    
    // Check if company exists for this user
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    let result;
    
    if (existingCompany) {
      // Update existing company
      const { data, error } = await supabase
        .from('companies')
        .update({
          name: companyDetails.name,
          registration_number: companyDetails.registrationNumber,
          vat_number: companyDetails.vatNumber,
          tax_registration_number: companyDetails.taxRegistrationNumber,
          csd_registration_number: companyDetails.csdRegistrationNumber,
          contact_email: companyDetails.contactEmail,
          contact_phone: companyDetails.contactPhone,
          address: companyDetails.address,
          address_line2: companyDetails.addressLine2,
          city: companyDetails.city,
          province: companyDetails.province,
          postal_code: companyDetails.postalCode,
          website_url: companyDetails.websiteUrl,
          director_first_name: companyDetails.directorFirstName,
          director_last_name: companyDetails.directorLastName,
          logo_url: companyDetails.logo,
          stamp_url: companyDetails.stamp,
          signature_url: companyDetails.signature,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingCompany.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Insert new company
      const { data, error } = await supabase
        .from('companies')
        .insert({
          user_id: user.id,
          name: companyDetails.name,
          registration_number: companyDetails.registrationNumber,
          vat_number: companyDetails.vatNumber,
          tax_registration_number: companyDetails.taxRegistrationNumber,
          csd_registration_number: companyDetails.csdRegistrationNumber,
          contact_email: companyDetails.contactEmail,
          contact_phone: companyDetails.contactPhone,
          address: companyDetails.address,
          address_line2: companyDetails.addressLine2,
          city: companyDetails.city,
          province: companyDetails.province,
          postal_code: companyDetails.postalCode,
          website_url: companyDetails.websiteUrl,
          director_first_name: companyDetails.directorFirstName,
          director_last_name: companyDetails.directorLastName,
          logo_url: companyDetails.logo,
          stamp_url: companyDetails.stamp,
          signature_url: companyDetails.signature,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    // Convert from snake_case to camelCase
    return {
      id: result.id,
      name: result.name,
      registrationNumber: result.registration_number,
      vatNumber: result.vat_number,
      taxRegistrationNumber: result.tax_registration_number,
      csdRegistrationNumber: result.csd_registration_number,
      contactEmail: result.contact_email,
      contactPhone: result.contact_phone,
      address: result.address,
      addressLine2: result.address_line2,
      city: result.city,
      province: result.province,
      postalCode: result.postal_code,
      websiteUrl: result.website_url,
      directorFirstName: result.director_first_name,
      directorLastName: result.director_last_name,
      logo: result.logo_url,
      stamp: result.stamp_url,
      signature: result.signature_url
    } as CompanyDetails;
  } catch (error) {
    console.error('Error saving company to Supabase:', error);
    throw error;
  }
};

/**
 * Load company details from Supabase
 * @returns Promise resolving to the company details
 */
export const loadCompanyFromSupabase = async (): Promise<CompanyDetails | null> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }
    
    // Get company for this user
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) return null;
    
    // Convert from snake_case to camelCase
    return {
      id: data.id,
      name: data.name,
      registrationNumber: data.registration_number,
      vatNumber: data.vat_number,
      taxRegistrationNumber: data.tax_registration_number,
      csdRegistrationNumber: data.csd_registration_number,
      contactEmail: data.contact_email,
      contactPhone: data.contact_phone,
      address: data.address,
      addressLine2: data.address_line2,
      city: data.city,
      province: data.province,
      postalCode: data.postal_code,
      websiteUrl: data.website_url,
      directorFirstName: data.director_first_name,
      directorLastName: data.director_last_name,
      logo: data.logo_url,
      stamp: data.stamp_url,
      signature: data.signature_url
    } as CompanyDetails;
  } catch (error) {
    console.error('Error loading company from Supabase:', error);
    return null;
  }
};

/**
 * Sync local company data with Supabase
 * This will push local data to Supabase and then pull the latest data back
 */
export const syncCompanyData = async (): Promise<void> => {
  try {
    // Get company data from localStorage
    const localData = localStorage.getItem('companyDetails');
    if (!localData) return;
    
    const companyDetails = safeJsonParse(localData, {}) as CompanyDetails;
    
    // Save to Supabase
    await saveCompanyToSupabase(companyDetails);
    
    // Update local storage with latest data
    const latestData = await loadCompanyFromSupabase();
    if (latestData) {
      localStorage.setItem('companyDetails', safeJsonStringify(latestData));
      
      // Also update public data
      const publicData = {
        name: latestData.name,
        contactEmail: latestData.contactEmail,
        contactPhone: latestData.contactPhone,
        address: latestData.address,
        addressLine2: latestData.addressLine2,
        city: latestData.city,
        province: latestData.province,
        postalCode: latestData.postalCode,
        websiteUrl: latestData.websiteUrl,
        logo: latestData.logo,
      };
      localStorage.setItem('publicCompanyDetails', safeJsonStringify(publicData));
    }
  } catch (error) {
    console.error('Error syncing company data:', error);
  }
};
