(function() {
   'use strict';

   const { addHeadElement } = require('hooks');
   const portletContextUtil = require('PortletContextUtil');
   const resourceLocatorUtil = require('ResourceLocatorUtil');
   const properties = require('Properties');
   const appData = require('appData');
   const nodeTreeUtil = require('NodeTreeUtil');
   const _ = require('underscore');
   const dateUtil = require('DateUtil');
   const currentPage = portletContextUtil.getCurrentPage();
  
   let ogTitle = properties.get(currentPage, 'og.title') !== null ? properties.get(currentPage, 'og.title') 
      : properties.get(currentPage, 'jcr:uuid').startsWith('5.') && properties.get(currentPage, 'articleName').length > 0 ? 
      properties.get(currentPage, 'articleName')
      : properties.get(currentPage, 'displayName');

   let ogImage = properties.get(currentPage, 'og.image') !== null ? properties.get(properties.get(currentPage, 'og.image'), 'URL') 
      : nodeTreeUtil.findPortletsByType(currentPage, 'image').size() > 0 && appData.get('imageChoiceSettings') === false ? 
      properties.get(properties.get(nodeTreeUtil.findPortletsByType(currentPage, 'image').get(0), 'image'), 'URL')
      : properties.get(appData.getNode('defaultImage'), 'URL');

   // Mandatory OGtags
   addHeadElement((req) => {  
      let metastring = '<meta property="og:title" content="' + "hej" + '">';  
      if (properties.get(currentPage, 'og.description') !== null)
      { 
         metastring += '<meta property="og:description" content="' + properties.get(currentPage, 'og.description') + '">';
      }
      metastring += '<meta property="og:url" content="' + properties.get(currentPage, 'URL') + '">';
      metastring += '<meta property="og:image" content="' + ogImage + '">';  
      return metastring; 
   });

   // Image tags
   if (appData.get('imageSettings') === false)
   {
      addHeadElement((req) => {  
         let imageString = '<meta property="og:image:height" content="' + properties.get(ogImage, 'height') + '">';  
         imageString += '<meta property="og:image:width" content="' + properties.get(ogImage, 'width') + '">';  
         imageString += '<meta property="og:image:type" content="' + properties.get(ogImage, 'mimeType') + '">';  
         for (let i = 1; i < nodeTreeUtil.findPortletsByType(currentPage, 'image').size(); i++){
            imageString += '<meta property="og:image" content="' + properties.get(properties.get(nodeTreeUtil.findPortletsByType(currentPage, 'image').get(i), 'image'), 'URL') + '">';
            imageString += '<meta property="og:image:width" content="' + properties.get(properties.get(properties.get(nodeTreeUtil.findPortletsByType(currentPage, 'image').get(i), 'image'), 'URL'), 'width') + '">';  
            imageString += '<meta property="og:image:height" content="' + properties.get(properties.get(properties.get(nodeTreeUtil.findPortletsByType(currentPage, 'image').get(i), 'image'), 'URL'), 'height') + '">';  
            imageString += '<meta property="og:image:type" content="' + properties.get(properties.get(properties.get(nodeTreeUtil.findPortletsByType(currentPage, 'image').get(i), 'image'), 'URL'), 'mimeType') + '">';  
         }
         return imageString;
      });
   }

   // Type and article tags
   if (properties.get(currentPage, 'jcr:uuid').startsWith('5.') )
   { 
      addHeadElement((req) => {
         return '<meta property="og:type" content="article">';
      });

      if (appData.get('articleSettings') === false)
      { 
         addHeadElement((req) => {
            let articleString = '<meta property="article:url" content="' + properties.get(currentPage, 'URL') + '">';
            articleString += '<meta property="article:published_time" content="' + dateUtil.getDateAsISO8601String
            (new Date(properties.get(currentPage, 'lastPublishDate'))) + '">'; 
            articleString += '<meta property="article:modified_time" content="' + dateUtil.getDateAsISO8601String
            (new Date(properties.get(currentPage, 'lastModifiedDate'))) + '">';
            if (dateUtil.getDateAsISO8601String(new Date(properties.get(currentPage, 'scheduledUnpublishDate'))) > 0){
               articleString += '<meta property="article:expiration_time" content="' + dateUtil.getDateAsISO8601String
               (new Date(properties.get(currentPage, 'scheduledUnpublishDate'))) + '">';
            }
            articleString += '<meta property="article:author" content="' + properties.get(properties.get(currentPage, 'createdBy'), 'displayName') + '">';
            return articleString;
         });
      }
   }
   else
   {
      addHeadElement((req) => {
         return '<meta property="og:type" content="website">';
      });
   }

   // Twitter tags
   if (appData.get('twitterSettings') === false)
   {
      addHeadElement((req) => {  

         let twitterString = '<meta property="twitter:card" content="summary">'; 
         twitterString += '<meta property="twitter:title" content="' + ogTitle + '">'; 
         if (properties.get(currentPage, 'og.description') !== null){
            twitterString +='<meta property="twitter:description" content="' + properties.get(currentPage, 'og.description') + '">';
         }
         twitterString += '<meta property="twitter:image" content="' + ogImage + '">';  
         return twitterString;
         });  
   }   

   // Other tags
   if (appData.get('otherSettings') === false)
   {
      addHeadElement((req) => {  
         let otherString = '<meta property="og:site_name" content="' + properties.get(resourceLocatorUtil.getSitePage(), 'displayName') + '">'; 
         otherString += '<meta property="og:locale" content="' + properties.get(resourceLocatorUtil.getSitePage(), 'locale') + '">';
         return otherString;
    });
   }
}());