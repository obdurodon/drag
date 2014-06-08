<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/1999/xhtml"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="#all" version="2.0"
    xmlns:svg="http://www.w3.org/2000/svg">
    <xsl:output method="xml" indent="yes"/>
    <xsl:strip-space elements="*"/>
    <xsl:template match="node()|@*">
        <xsl:copy>
            <xsl:apply-templates select="node()|@*"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:svg">
        <!-- 
        Input: contains wrapper <g transform="translate(100, 57)"> for columns plus stand-alone lines
        Output: apply templates to the <g> but ignore the lines
        -->
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates select="svg:g"/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:svg/svg:g">
        <!-- 
        Input: contains columns
        Output: child <g> for columns and new child <g> for lines
        -->
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <svg:g id="columns">
                <xsl:copy-of select="svg:g"/>
            </svg:g>
            <svg:g id="lines">
                <xsl:apply-templates select="../svg:line"/>
            </svg:g>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:g/svg:g">
        <xsl:copy>
            <xsl:apply-templates select="@*"/>
            <xsl:apply-templates/>
        </xsl:copy>
    </xsl:template>
    <xsl:template match="svg:line">
        <xsl:copy>
            <xsl:apply-templates select="@* except (@x1|@x2|@y1|@y2)"/>
            <xsl:attribute name="x1" select="@x1 + 100"/>
            <xsl:attribute name="x2" select="@x2 + 101"/>
            <xsl:attribute name="y1" select="@y1 - 57"/>
            <xsl:attribute name="y2" select="@y2 - 57"/>
        </xsl:copy>
    </xsl:template>
</xsl:stylesheet>
